const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src', 'app', '(dashboard)', 'payroll-compliance');
const scDir = path.join(baseDir, 'salary-component');
const stDir = path.join(baseDir, 'salary-template');

if (!fs.existsSync(scDir)) fs.mkdirSync(scDir, { recursive: true });
if (!fs.existsSync(stDir)) fs.mkdirSync(stDir, { recursive: true });

const salaryComponentPage = `"use client";
import React, { useState, useEffect } from 'react';
import axios from '@/utils/axios';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SalaryComponentPage() {
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('EARNING');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchComponents = async () => {
    try {
      const { data } = await axios.get('/payroll/payroll-compliance/salary-component-configs');
      setComponents(data.data || []);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load components');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponents();
  }, []);

  const handleDelete = async (id, isDeletable) => {
    if (!isDeletable) {
      toast.error('Cannot delete mandatory statutory component');
      return;
    }
    if (!confirm('Are you sure you want to delete this component?')) return;
    try {
      await axios.delete(\`/payroll/payroll-compliance/salary-component-configs/\${id}\`);
      toast.success('Deleted successfully');
      fetchComponents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const ComponentModal = ({ onClose, onSuccess, initialData }) => {
    const [formData, setFormData] = useState(initialData || {
      name: '', type: activeTab, category: 'Non-Statutory', calculationType: 'FIXED_AMOUNT',
      value: 0, considerForPf: false, considerForEsi: false, taxable: true, status: 'ACTIVE'
    });

    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        if (initialData?.id) {
          await axios.put(\`/payroll/payroll-compliance/salary-component-configs/\${initialData.id}\`, formData);
          toast.success('Updated successfully');
        } else {
          await axios.post('/payroll/payroll-compliance/salary-component-configs', formData);
          toast.success('Created successfully');
        }
        onSuccess();
      } catch (err) {
        toast.error(err.response?.data?.message || 'Error saving component');
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">{initialData ? 'Edit Component' : 'Add Component'}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input required className="w-full border rounded p-2" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select className="w-full border rounded p-2" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                  <option value="EARNING">Earning</option>
                  <option value="DEDUCTION">Deduction</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Calculation Type</label>
                <select className="w-full border rounded p-2" value={formData.calculationType} onChange={e => setFormData({...formData, calculationType: e.target.value})}>
                  <option value="FIXED_AMOUNT">Fixed Amount</option>
                  <option value="PERCENTAGE_OF_BASIC">Percentage of Basic</option>
                  <option value="PERCENTAGE_OF_CTC">Percentage of CTC</option>
                  <option value="FORMULA_BASED">Formula Based</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Default Value / Percentage</label>
              <input type="number" step="0.01" className="w-full border rounded p-2" value={formData.value || ''} onChange={e => setFormData({...formData, value: parseFloat(e.target.value)})} />
            </div>
            {formData.calculationType === 'FORMULA_BASED' && (
              <div>
                <label className="block text-sm font-medium mb-1">Formula (Optional)</label>
                <input className="w-full border rounded p-2" value={formData.formula || ''} onChange={e => setFormData({...formData, formula: e.target.value})} />
              </div>
            )}
            <div className="flex gap-4 mb-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.considerForPf} onChange={e => setFormData({...formData, considerForPf: e.target.checked})} /> PF Applicable
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.considerForEsi} onChange={e => setFormData({...formData, considerForEsi: e.target.checked})} /> ESI Applicable
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.taxable} onChange={e => setFormData({...formData, taxable: e.target.checked})} /> Taxable
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select className="w-full border rounded p-2" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button type="button" onClick={onClose} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Save</button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const filtered = components.filter(c => c.type === activeTab);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Salary Components</h1>
        <button onClick={() => { setEditData(null); setIsModalOpen(true); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700">
          <Plus size={18} /> Add Component
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="flex border-b">
          {['EARNING', 'DEDUCTION'].map(tab => (
            <button key={tab} className={\`px-6 py-3 font-medium \${activeTab === tab ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}\`} onClick={() => setActiveTab(tab)}>
              {tab === 'EARNING' ? 'Earnings' : 'Deductions'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="p-4 font-medium text-gray-600">Name</th>
                  <th className="p-4 font-medium text-gray-600">Type</th>
                  <th className="p-4 font-medium text-gray-600">Calculation Type</th>
                  <th className="p-4 font-medium text-gray-600 text-center">PF App.</th>
                  <th className="p-4 font-medium text-gray-600 text-center">ESI App.</th>
                  <th className="p-4 font-medium text-gray-600">Status</th>
                  <th className="p-4 font-medium text-gray-600 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan="7" className="p-8 text-center text-gray-500">No components found</td></tr>
                ) : filtered.map(c => (
                  <tr key={c.id} className="border-b hover:bg-gray-50">
                    <td className="p-4 font-medium">
                      {c.name}
                      {c.isDefault && <span className="ml-2 text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">System</span>}
                    </td>
                    <td className="p-4">{c.category}</td>
                    <td className="p-4">{c.calculationType}</td>
                    <td className="p-4 text-center">{c.considerForPf ? <CheckCircle className="text-green-500 mx-auto" size={18} /> : <XCircle className="text-gray-300 mx-auto" size={18} />}</td>
                    <td className="p-4 text-center">{c.considerForEsi ? <CheckCircle className="text-green-500 mx-auto" size={18} /> : <XCircle className="text-gray-300 mx-auto" size={18} />}</td>
                    <td className="p-4">
                      <span className={\`px-2 py-1 rounded text-xs font-semibold \${c.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}\`}>
                        {c.status}
                      </span>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-3">
                      <button onClick={() => { setEditData(c); setIsModalOpen(true); }} className="text-blue-600 hover:text-blue-800">
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDelete(c.id, c.deletable)} className={\`\${c.deletable ? 'text-red-500 hover:text-red-700' : 'text-gray-300 cursor-not-allowed'}\`}>
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && (
        <ComponentModal 
          initialData={editData} 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={() => { setIsModalOpen(false); fetchComponents(); }} 
        />
      )}
    </div>
  );
}
`;

fs.writeFileSync(path.join(scDir, 'page.js'), salaryComponentPage);

const salaryTemplatePage = `"use client";
import React, { useState, useEffect } from 'react';
import axios from '@/utils/axios';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SalaryTemplatePage() {
  const [templates, setTemplates] = useState([]);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchData = async () => {
    try {
      const [tplRes, compRes] = await Promise.all([
        axios.get('/payroll/payroll-compliance/salary-templates'),
        axios.get('/payroll/payroll-compliance/salary-component-configs')
      ]);
      setTemplates(tplRes.data.data || []);
      setComponents(compRes.data.data?.filter(c => c.status === 'ACTIVE') || []);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load data');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await axios.delete(\`/payroll/payroll-compliance/salary-templates/\${id}\`);
      toast.success('Deleted successfully');
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
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
          await axios.put(\`/payroll/payroll-compliance/salary-templates/\${initialData.id}\`, payload);
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
    </div>
  );
}
`;

fs.writeFileSync(path.join(stDir, 'page.js'), salaryTemplatePage);

console.log('Frontend pages injected successfully!');
