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
            <PolarGrid stroke="var(--border)" />
            <PolarAngleAxis 
              dataKey="subject" 
              tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }} 
            />
            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
            <Radar
              name="Skills"
              dataKey="score"
              stroke="var(--primary)"
              fill="var(--primary)"
              fillOpacity={0.5}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'var(--card)', 
                borderColor: 'var(--border)',
                borderRadius: '8px',
                color: 'var(--card-foreground)'
              }}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
