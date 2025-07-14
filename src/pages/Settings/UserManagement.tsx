import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Edit, Shield, ShieldOff, RotateCcw, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  role: 'admin' | 'manager' | 'hr' | 'seller';
  isActive: boolean;
  createdAt: string;
}

const userSchema = z.object({
  fullName: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
  mobile: z.string().regex(/^09\d{9}$/, 'شماره موبایل معتبر وارد کنید'),
  email: z.string().email('ایمیل معتبر وارد کنید'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
  role: z.enum(['admin', 'manager', 'hr', 'seller']),
  isActive: z.boolean(),
});

type UserForm = z.infer<typeof userSchema>;

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    fullName: 'احمد محمدی',
    mobile: '09123456789',
    email: 'admin@vashnia.com',
    role: 'admin',
    isActive: true,
    createdAt: '1403/10/15',
  },
  {
    id: '2',
    fullName: 'فاطمه احمدی',
    mobile: '09123456788',
    email: 'hr@vashnia.com',
    role: 'hr',
    isActive: true,
    createdAt: '1403/10/10',
  },
  {
    id: '3',
    fullName: 'علی رضایی',
    mobile: '09123456787',
    email: 'manager@vashnia.com',
    role: 'manager',
    isActive: false,
    createdAt: '1403/09/20',
  },
];

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const { toast } = useToast();

  const form = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: '',
      mobile: '',
      email: '',
      password: '',
      role: 'seller',
      isActive: true,
    },
  });

  const getRoleBadge = (role: User['role']) => {
    const roleConfig = {
      admin: { label: 'مدیر کل', variant: 'destructive' as const },
      manager: { label: 'مدیر', variant: 'default' as const },
      hr: { label: 'منابع انسانی', variant: 'secondary' as const },
      seller: { label: 'فروشنده', variant: 'outline' as const },
    };
    return roleConfig[role];
  };

  const getRolePermissions = (role: User['role']) => {
    const permissions = {
      admin: 'دسترسی کامل به همه بخش‌ها',
      manager: 'مشاهده و تایید درخواست‌ها، گزارشات',
      hr: 'کارکنان، درخواست‌ها، حقوق و دستمزد',
      seller: 'فقط بخش فروش',
    };
    return permissions[role];
  };

  const onSubmit = (data: UserForm) => {
    if (editingUser) {
      // Update existing user
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id 
          ? { ...user, ...data, id: editingUser.id, createdAt: editingUser.createdAt }
          : user
      ));
      toast({
        title: 'کاربر بروزرسانی شد',
        description: 'اطلاعات کاربر با موفقیت بروزرسانی شد.',
      });
    } else {
      // Create new user
      const newUser: User = {
        id: (users.length + 1).toString(),
        ...data,
        createdAt: new Date().toLocaleDateString('fa-IR'),
      };
      setUsers(prev => [...prev, newUser]);
      toast({
        title: 'کاربر ایجاد شد',
        description: 'کاربر جدید با موفقیت ایجاد شد.',
      });
    }
    
    setIsDialogOpen(false);
    setEditingUser(null);
    form.reset();
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.reset({
      fullName: user.fullName,
      mobile: user.mobile,
      email: user.email,
      password: '', // Don't populate password for security
      role: user.role,
      isActive: user.isActive,
    });
    setIsDialogOpen(true);
  };

  const handleToggleActive = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    ));
    toast({
      title: 'وضعیت کاربر تغییر کرد',
      description: 'وضعیت فعال/غیرفعال کاربر بروزرسانی شد.',
    });
  };

  const handleResetPassword = (userId: string) => {
    // In real implementation, this would generate a new password and send via SMS/email
    toast({
      title: 'رمز عبور بازنشانی شد',
      description: 'رمز عبور جدید به ایمیل کاربر ارسال شد.',
    });
  };

  const handleDelete = (userId: string) => {
    if (confirm('آیا از حذف این کاربر اطمینان دارید؟')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
      toast({
        title: 'کاربر حذف شد',
        description: 'کاربر با موفقیت حذف شد.',
      });
    }
  };

  const openNewUserDialog = () => {
    setEditingUser(null);
    form.reset();
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">مدیریت کاربران</h2>
          <p className="text-muted-foreground">ایجاد، ویرایش و مدیریت کاربران سیستم</p>
        </div>
        <Button onClick={openNewUserDialog}>
          <Plus className="w-4 h-4 ml-2" />
          کاربر جدید
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>لیست کاربران ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">نام کاربر</TableHead>
                  <TableHead className="text-right">موبایل</TableHead>
                  <TableHead className="text-right">ایمیل</TableHead>
                  <TableHead className="text-right">نقش</TableHead>
                  <TableHead className="text-right">وضعیت</TableHead>
                  <TableHead className="text-right">تاریخ ایجاد</TableHead>
                  <TableHead className="text-right">عملیات</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="text-right font-medium">{user.fullName}</TableCell>
                    <TableCell className="text-right">{user.mobile}</TableCell>
                    <TableCell className="text-right">{user.email}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant={getRoleBadge(user.role).variant}>
                        {getRoleBadge(user.role).label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'فعال' : 'غیرفعال'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{user.createdAt}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-2 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(user)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(user.id)}
                        >
                          {user.isActive ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleResetPassword(user.id)}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(user.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Role Permissions Info */}
      <Card>
        <CardHeader>
          <CardTitle>سطوح دسترسی</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(['admin', 'manager', 'hr', 'seller'] as const).map((role) => (
              <div key={role} className="p-4 bg-secondary/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={getRoleBadge(role).variant}>
                    {getRoleBadge(role).label}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {getRolePermissions(role)}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* User Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingUser ? 'ویرایش کاربر' : 'ایجاد کاربر جدید'}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام و نام خانوادگی *</FormLabel>
                    <FormControl>
                      <Input placeholder="نام کاربر" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>شماره موبایل *</FormLabel>
                    <FormControl>
                      <Input placeholder="09123456789" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ایمیل *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="user@vashnia.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رمز عبور *</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder={editingUser ? 'برای تغییر وارد کنید' : 'رمز عبور'} 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نقش کاربری *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب نقش" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">مدیر کل</SelectItem>
                        <SelectItem value="manager">مدیر</SelectItem>
                        <SelectItem value="hr">منابع انسانی</SelectItem>
                        <SelectItem value="seller">فروشنده</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  انصراف
                </Button>
                <Button type="submit" className="flex-1">
                  {editingUser ? 'بروزرسانی' : 'ایجاد'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}