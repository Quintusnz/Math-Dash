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

const MOCK_DATA: SkillData[] = [
  { subject: 'Addition', score: 80, fullMark: 100 },
  { subject: 'Subtraction', score: 65, fullMark: 100 },
  { subject: 'Multiplication', score: 40, fullMark: 100 },
  { subject: 'Division', score: 20, fullMark: 100 },
  { subject: 'Speed', score: 90, fullMark: 100 },
  { subject: 'Accuracy', score: 75, fullMark: 100 },
];

export function SkillRadar({ data = MOCK_DATA }: SkillRadarProps) {
  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Skill Breakdown</h3>
      <div className={styles.chartWrapper}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
            <PolarGrid stroke="#e5e7eb" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: '#6b7280', fontSize: 12 }} 
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Skills"
              dataKey="score"
              stroke="#4f46e5"
              fill="#4f46e5"
              fillOpacity={0.5}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                borderColor: '#e5e7eb',
                borderRadius: '8px',
                color: '#111827'
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
