import { Users, Calendar, CheckCircle, Clock, XCircle, Home } from 'lucide-react';

const QuickStats = ({ leaves }) => {
  const stats = {
    total: leaves.length,
    approved: leaves.filter(l => l.status === 'approved').length,
    pending: leaves.filter(l => l.status === 'pending').length,
    rejected: leaves.filter(l => l.status === 'rejected').length,
    wfh: leaves.filter(l => l.wfh).length,
    halfDays: leaves.filter(l => l.halfDay).length
  };

  const statCards = [
    {
      title: "Total Leaves",
      value: stats.total,
      icon: <Calendar className="w-5 h-5" />,
      color: "bg-brand-500",
      textColor: "text-brand-500"
    },
    {
      title: "Approved",
      value: stats.approved,
      icon: <CheckCircle className="w-5 h-5" />,
      color: "bg-green-500",
      textColor: "text-green-500"
    },
    {
      title: "Pending",
      value: stats.pending,
      icon: <Clock className="w-5 h-5" />,
      color: "bg-yellow-500",
      textColor: "text-yellow-500"
    },
    {
      title: "Rejected",
      value: stats.rejected,
      icon: <XCircle className="w-5 h-5" />,
      color: "bg-red-500",
      textColor: "text-red-500"
    },
    {
      title: "Work From Home",
      value: stats.wfh,
      icon: <Home className="w-5 h-5" />,
      color: "bg-indigo-500",
      textColor: "text-indigo-500"
    },
    {
      title: "Half Days",
      value: stats.halfDays,
      icon: <Users className="w-5 h-5" />,
      color: "bg-purple-500",
      textColor: "text-purple-500"
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6 auto-rows-fr">
      {statCards.map((card, index) => (
        <div
          key={index}
          className="h-full bg-white dark:bg-gray-800 rounded-sm shadow p-4 flex flex-col"
        >
          {/* 1) Color + icon */}
          <div className={`h-11 w-11 rounded-full ${card.color} bg-opacity-10 flex items-center justify-center`}>
            <div className={card.textColor}>{card.icon}</div>
          </div>

          {/* 2) Title */}
          <p className="mt-3 text-sm font-semibold text-gray-700 dark:text-gray-300 leading-snug min-h-[40px]">
            {card.title}
          </p>

          {/* 3) Value */}
          <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
            {card.value}
          </p>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;