import { Tab, Tabs } from '@mui/material';

interface Tab {
  id: string;
  label: string;
}

interface TabBarProps {
  tabs: Tab[];
  active: string;
  onChange: (id: string) => void;
}

export function TabBar({ tabs, active, onChange }: TabBarProps) {
  return (
    <Tabs
      value={active}
      onChange={(_, id) => onChange(id)}
      sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
      variant="scrollable"
      scrollButtons="auto"
    >
      {tabs.map((tab) => (
        <Tab key={tab.id} value={tab.id} label={tab.label} sx={{ textTransform: 'none', fontWeight: 600, minHeight: 44 }} />
      ))}
    </Tabs>
  );
}
