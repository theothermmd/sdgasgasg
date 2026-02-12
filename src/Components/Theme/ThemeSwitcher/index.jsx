import { useEffect, useState } from 'react';
import { Dropdown, Button } from 'antd';
import { Sun, Moon, Monitor } from 'lucide-react';

export default function ThemeSwitcher() {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.theme) {
        return localStorage.theme;
      }
      if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    if (theme === 'system') {
      localStorage.removeItem('theme');
    } else {
      localStorage.theme = theme;
    }

    // 🔥 خبر بده به کل اپ
    window.dispatchEvent(new Event("theme-change"));

  }, [theme]);


  const items = [
    {
      key: 'light',
      label: (
        <div className='flex items-center gap-2'>
          <Sun size={16} /> روشن
        </div>
      ),
    },
    {
      key: 'dark',
      label: (
        <div className='flex items-center gap-2'>
          <Moon size={16} /> تاریک
        </div>
      ),
    },
    {
      key: 'system',
      label: (
        <div className='flex items-center gap-2'>
          <Monitor size={16} /> سیستم
        </div>
      ),
    },
  ];

  return (
    <Dropdown
      menu={{
        items,
        onClick: ({ key }) => setTheme(key),
      }}
      trigger={['click']}
    >
      <Button type='text' >
        {theme === 'light' && <Sun size={18} color='white' />}
        {theme === 'dark' && <Moon size={18} color='white' />}
        {theme === 'system' && <Monitor size={18} color='white' />}
      </Button>
    </Dropdown>
  );
}
