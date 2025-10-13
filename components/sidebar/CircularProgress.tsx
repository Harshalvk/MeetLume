import React from "react";

type CircularProgressBarProps = {
  value?: number;
  color?: string;
  size?: number;
  strokeWidth?: number;
  children?: React.ReactNode;
};

const cleanPercentage = (percentage: number = 0) => {
  const isInvalid = !Number.isFinite(+percentage) || percentage < 0;
  const isTooHigh = percentage > 100;
  return isInvalid ? 0 : isTooHigh ? 100 : +percentage;
};

const CircularProgressBar: React.FC<CircularProgressBarProps> = ({
  value = 0,
  color = "#10b981",
  size = 55,
  strokeWidth = 4,
  children,
}) => {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = cleanPercentage(value);
  const strokeDashoffset = ((100 - percentage) / 100) * circumference;

  return (
    <svg width={size} height={size} className="relative">
      <g transform={`rotate(-90 ${center} ${center})`}>
        <circle
          r={radius}
          cx={center}
          cy={center}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
        />

        <circle
          r={radius}
          cx={center}
          cy={center}
          fill="transparent"
          stroke="white"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-500 ease-out"
          strokeLinecap="round"
        />
      </g>

      <foreignObject
        x={strokeWidth}
        y={strokeWidth}
        width={size - strokeWidth * 2}
        height={size - strokeWidth * 2}
      >
        <div className="w-full h-full flex items-center justify-center">
          {children ?? (
            <span className="text-sm font-semibold">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      </foreignObject>
    </svg>
  );
};

export default CircularProgressBar;
