"use client";
import React, { useState, useEffect } from 'react';
import axios from '@/lib/api';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';
import ConfirmModal from '@/components/common/ConfirmModal';

export default function SalaryTemplatePage() {
  const [templates, setTemplates] = useState([]);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = async () => {
    try {
      const [tplRes, compRes] = await Promise.all([
        axios.get('/payroll/payroll-compliance/salary-templates'),
        axios.get('/payroll/payroll-compliance/salary-component-configs')
      ]);
      setTemplates(tplRes.data.data || []);
      const componentsData = Array.isArray(compRes.data.data) ? compRes.data.data : (compRes.data.data?.components || []);
      setComponents(componentsData.filter(c => c.status === 'ACTIVE'));
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = (id) => {
    setDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    try {
      setIsDeleting(true);
      await axios.delete(`/payroll/payroll-compliance/salary-templates/${deleteId}`);
      toast.success('Deleted successfully');
      setDeleteId(null);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setIsDeleting(false);
    }
  };

  const TemplateModal = ({ onClose, onSuccess, initialData }) => {
    const [name, setName] = useState(initialData?.templateName || '');
    const [desc, setDesc] = useState(initialData?.description || '');
    const [selectedComponents, setSelectedComponents] = useState(
      initialData?.components?.map(c => ({
        componentId: c.componentId,
        overrideValue: c.overrideValue || '',
        overrideCalculationType: c.overrideCalculationType || c.component.calculationType,
        name: c.component.name,
        type: c.component.type
      })) || []
    );

    const toggleComponent = (comp) => {
      const exists = selectedComponents.find(c => c.componentId === comp.id);
      if (exists) {
        setSelectedComponents(selectedComponents.filter(c => c.componentId !== comp.id));
      } else {
        setSelectedComponents([...selectedComponents, {
          componentId: comp.id, overrideValue: comp.value || '', overrideCalculationType: comp.calculationType, name: comp.name, type: comp.type
        }]);
      }
    };

    const updateOverride = (id, field, value) => {
      setSelectedComponents(selectedComponents.map(c => c.componentId === id ? { ...c, [field]: value } : c));
    };

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (!name) return toast.error('Name is required');
      if (selectedComponents.length === 0) return toast.error('Select at least one component');

      const payload = {
        templateName: name, 
        description: desc,
        components: selectedComponents.map(c => ({
          componentId: c.componentId,
          overrideValue: parseFloat(c.overrideValue) || null,
          overrideCalculationType: c.overrideCalculationType
        }))
      };

      try {
        if (initialData?.id) {
          await axios.put(`/payroll/payroll-compliance/salary-templates/${initialData.id}`, payload);
          toast.success('Updated successfully');
        } else {
          await axios.post('/payroll/payroll-compliance/salary-templates', payload);
          toast.success('Created successfully');
        }
        onSuccess();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error saving template');
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] flex flex-col">
          <h2 className="text-xl font-semibold mb-4">{initialData ? 'Edit Template' : 'Add Template'}</h2>
          
          <div className="flex-1 overflow-y-auto pr-2">
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Template Name</label>
                <input required className="w-full border rounded p-2" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <input className="w-full border rounded p-2" value={desc} onChange={e => setDesc(e.target.value)} />
              </div>
            </div>

            <h3 className="font-medium mb-2">Select & Configure Components</h3>
            <div className="grid grid-cols-2 gap-6">
              <div className="border rounded p-4 h-[400px] overflow-y-auto">
                <h4 className="font-semibold mb-3 sticky top-0 bg-white">Available Components</h4>
                {components.map(c => (
                  <div key={c.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 border-b">
                    <input type="checkbox" className="w-4 h-4" 
                      checked={!!selectedComponents.find(sc => sc.componentId === c.id)}
                      onChange={() => toggleComponent(c)}
                    />
                    <div>
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-gray-500">{c.type} • {c.calculationType}</div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border rounded p-4 h-[400px] overflow-y-auto bg-gray-50">
                 <h4 className="font-semibold mb-3 sticky top-0 bg-gray-50 z-10">Selected Components</h4>
                 {selectedComponents.length === 0 && <p className="text-gray-500 text-sm italic">No components selected</p>}
                 {selectedComponents.map(sc => (
                   <div key={sc.componentId} className="bg-white p-3 border rounded mb-2 shadow-sm">
                     <div className="flex justify-between items-center mb-2">
                       <span className="font-medium flex items-center gap-2">
                         <GripVertical size={14} className="text-gray-400" />
                         {sc.name} <span className="text-xs text-gray-400">({sc.type})</span>
                       </span>
                     </div>
                     <div className="grid grid-cols-2 gap-2 text-sm">
                       <div>
                         <label className="block text-xs text-gray-500 mb-1">Calculation</label>
                         <select className="w-full border rounded p-1" value={sc.overrideCalculationType} onChange={e => updateOverride(sc.componentId, 'overrideCalculationType', e.target.value)}>
                           <option value="FIXED_AMOUNT">Fixed Amount</option>
                           <option value="PERCENTAGE_OF_BASIC">Percentage of Basic</option>
                           <option value="PERCENTAGE_OF_CTC">Percentage of CTC</option>
                           <option value="FORMULA_BASED">Formula Based</option>
                         </select>
                       </div>
                       <div>
                         <label className="block text-xs text-gray-500 mb-1">Value/Percent</label>
                         <input type="number" step="0.01" className="w-full border rounded p-1" value={sc.overrideValue} onChange={e => updateOverride(sc.componentId, 'overrideValue', e.target.value)} />
                       </div>
                     </div>
                   </div>
                 ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
            <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save Template</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Salary Templates</h1>
        <button onClick={() => { setEditData(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Plus size={18} /> Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? <div className="p-4">Loading...</div> : templates.map(t => (
          <div key={t.id} className="bg-white border rounded-lg shadow-sm hover:shadow transition-shadow overflow-hidden flex flex-col">
            <div className="p-5 border-b">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{t.templateName}</h3>
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">{t.status}</span>
              </div>
              <p className="text-gray-500 text-sm line-clamp-2 min-h-[40px]">{t.description || 'No description provided.'}</p>
            </div>
            
            <div className="p-5 bg-gray-50 flex-1">
              <h4 className="text-xs font-semibold text-gray-500 uppercase mb-3">Included Components</h4>
              <div className="flex flex-wrap gap-2">
                {t.components?.slice(0, 6).map(c => (
                  <span key={c.id} className="bg-white border text-gray-700 text-xs px-2 py-1 rounded shadow-sm">
                    {c.component?.name}
                  </span>
                ))}
                {t.components?.length > 6 && (
                  <span className="bg-gray-200 text-gray-600 text-xs px-2 py-1 rounded shadow-sm">
                    +{t.components.length - 6} more
                  </span>
                )}
              </div>
            </div>

            <div className="p-4 border-t bg-white flex justify-end gap-4">
               <button onClick={() => { setEditData(t); setIsModalOpen(true); }} className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-800 font-medium">
                 <Edit2 size={14} /> Edit
               </button>
               <button onClick={() => handleDelete(t.id)} className="flex items-center gap-1 text-sm text-red-500 hover:text-red-700 font-medium">
                 <Trash2 size={14} /> Delete
               </button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <TemplateModal 
          initialData={editData} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => { setIsModalOpen(false); fetchData(); }} 
        />
      )}

      <ConfirmModal 
        isOpen={!!deleteId}
        title="Delete Salary Template"
        description="Are you sure you want to delete this salary template? This action cannot be undone."
        confirmText={isDeleting ? "Deleting..." : "Delete"}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
        confirmButtonClassName="bg-red-600 hover:bg-red-700 disabled:opacity-50"
      />
    </div>
  );
}
