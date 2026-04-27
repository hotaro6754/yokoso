const PolicyStatusBadge = ({ status }) => {
  const statusConfig = {
    active: {
      label: 'Active',
      color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    },
    draft: {
      label: 'Draft',
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    },
    pending: {
      label: 'Pending',
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    },
    archived: {
      label: 'Archived',
      color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  };

  const config = statusConfig[status] || statusConfig.draft;

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
      {config.label}
    </span>
  );
};

export default PolicyStatusBadge;