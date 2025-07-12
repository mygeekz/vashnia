import { Bell, Search, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export const Header = () => {
  return (
    <header className="bg-card border-b border-border px-6 py-4 shadow-soft">
      <div className="flex items-center justify-between">
        {/* Search Section */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="جستجو در سیستم..."
              className="pr-10 bg-background"
            />
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full text-xs"></span>
          </Button>

          {/* User Menu */}
          <Button variant="ghost" className="gap-2">
            <User className="w-5 h-5" />
            <span className="hidden md:inline">مدیر سیستم</span>
          </Button>
        </div>
      </div>
    </header>
  );
};