"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';
import styles from './SkillRadar.module.css';

interface SkillData {
  subject: string;
  score: number; // 0-100
  fullMark: number;
}

interface SkillRadarProps {
  data?: SkillData[];
}

const DEFAULT_DATA: SkillData[] = [
  { subject: 'Addition', score: 0, fullMark: 100 },
  { subject: 'Subtraction', score: 0, fullMark: 100 },
  { subject: 'Multiplication', score: 0, fullMark: 100 },
  { subject: 'Division', score: 0, fullMark: 100 },
  { subject: 'Speed', score: 0, fullMark: 100 },
  { subject: 'Accuracy', score: 0, fullMark: 100 },
];

export function SkillRadar({ data }: SkillRadarProps) {
  const chartData = data && data.length > 0 ? data : DEFAULT_DATA;
  const hasRealData = data && data.some(d => d.score > 0);

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Skill Breakdown</h3>
      {!hasRealData && (
        <p className={styles.emptyHint}>Play some games to see your skill breakdown!</p>
      )}
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={chartData}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#6b7280', fontSize: 12 }} 
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Skills"
              dataKey="score"
              stroke={hasRealData ? "#4f46e5" : "#d1d5db"}
              fill={hasRealData ? "#4f46e5" : "#e5e7eb"}
              fillOpacity={hasRealData ? 0.5 : 0.3}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                borderColor: '#e5e7eb',
                borderRadius: '8px',
                color: '#111827'
              }}
              formatter={(value: number) => [`${value}%`, 'Score']}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
