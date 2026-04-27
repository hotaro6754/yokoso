import React from "react";

const HRMetricsSection = ({ title, metrics, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">
          {title}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="animate-pulse bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 h-32 rounded-xl border border-gray-200 dark:border-gray-600"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-red-200 dark:border-red-800 p-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (!metrics || metrics.length === 0) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">
        {title}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="group relative bg-gradient-to-br from-gray-50 to-white dark:from-gray-700/50 dark:to-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-600 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-300 overflow-hidden"
          >
            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-blue-100/50 to-transparent dark:from-blue-900/20 rounded-bl-full opacity-50 group-hover:opacity-70 transition-opacity duration-300"></div>
            
            {/* Content */}
            <div className="relative z-10">
              {/* Icon */}
              <div className="mb-3 flex items-center justify-between">
                <div className={`p-2.5 rounded-lg ${metric.iconBgColor || 'bg-gradient-to-br from-blue-500 to-blue-600'} shadow-sm`}>
                  {metric.icon && (
                    <div className="text-white">
                      {metric.icon}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Label */}
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
                {metric.label}
              </p>
              
              {/* Value */}
              <p className="text-3xl font-bold text-gray-800 dark:text-white">
                {metric.value !== null && metric.value !== undefined
                  ? metric.value.toLocaleString()
                  : "N/A"}
              </p>
              
              {/* Optional badge */}
              {metric.badge && (
                <div className="mt-3 inline-block">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${metric.badgeColor || 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'}`}>
                    {metric.badge}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HRMetricsSection;
