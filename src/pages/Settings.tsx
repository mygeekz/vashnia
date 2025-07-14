import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTheme } from 'next-themes';
import { Moon, Sun, User, Lock, Bell, Globe, Plus, Edit, Trash2, RotateCcw, UserPlus } from 'lucide-react';
import { toast } from 'sonner';

const userSchema = z.object({
  name: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
  mobile: z.string().regex(/^09\d{9}$/, 'شماره موبایل معتبر وارد کنید'),
  email: z.string().email('ایمیل معتبر وارد کنید'),
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
  role: z.enum(['admin', 'manager', 'hr', 'seller'], {
    message: 'انتخاب نقش کاربری اجباری است'
  })
});

type UserFormData = z.infer<typeof userSchema>;

interface User {
  id: string;
  name: string;
  mobile: string;
  email: string;
  role: 'admin' | 'manager' | 'hr' | 'seller';
  isActive: boolean;
  createdAt: string;
}

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const [profileData, setProfileData] = React.useState({
    name: 'مدیر سیستم',
    email: 'admin@vashnia.com',
    phone: '09123456789'
  });

  const [passwordData, setPasswordData] = React.useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notifications, setNotifications] = React.useState({
    emailNotifications: true,
    pushNotifications: true,
    weeklyReports: false
  });

  // User Management State
  const [users, setUsers] = React.useState<User[]>([
    {
      id: '1',
      name: 'مدیر سیستم',
      mobile: '09123456789',
      email: 'admin@vashnia.com',
      role: 'admin',
      isActive: true,
      createdAt: '1404/03/01'
    },
    {
      id: '2',
      name: 'علی احمدی',
      mobile: '09123456788',
      email: 'ali@vashnia.com',
      role: 'manager',
      isActive: true,
      createdAt: '1404/03/05'
    },
    {
      id: '3',
      name: 'فاطمه کریمی',
      mobile: '09123456787',
      email: 'fateme@vashnia.com',
      role: 'hr',
      isActive: true,
      createdAt: '1404/03/10'
    }
  ]);
  
  const [isUserDialogOpen, setIsUserDialogOpen] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<User | null>(null);
  
  const userForm = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      mobile: '',
      email: '',
      password: '',
      role: 'seller'
    }
  });
  
  React.useEffect(() => {
    if (editingUser) {
      userForm.reset({
        name: editingUser.name,
        mobile: editingUser.mobile,
        email: editingUser.email,
        password: '',
        role: editingUser.role
      });
    } else {
      userForm.reset({
        name: '',
        mobile: '',
        email: '',
        password: '',
        role: 'seller'
      });
    }
  }, [editingUser, userForm]);

  const handleProfileUpdate = () => {
    // TODO: Implement profile update API call
    toast.success('اطلاعات پروفایل با موفقیت بروزرسانی شد');
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('رمز عبور جدید و تأیید رمز عبور مطابقت ندارند');
      return;
    }
    // TODO: Implement password change API call
    toast.success('رمز عبور با موفقیت تغییر یافت');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleCreateUser = (data: UserFormData) => {
    if (editingUser) {
      // Update existing user
      const updatedUser: User = {
        ...editingUser,
        ...data,
      };
      setUsers(prev => prev.map(user => 
        user.id === editingUser.id ? updatedUser : user
      ));
      toast.success('کاربر با موفقیت به‌روزرسانی شد');
    } else {
      // Create new user
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        ...data,
        isActive: true,
        createdAt: new Date().toLocaleDateString('fa-IR')
      };
      setUsers(prev => [...prev, newUser]);
      toast.success('کاربر جدید ایجاد شد');
    }
    
    setIsUserDialogOpen(false);
    setEditingUser(null);
    userForm.reset();
  };
  
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsUserDialogOpen(true);
  };
  
  const handleDeactivateUser = (userId: string) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    ));
    toast.success('وضعیت کاربر تغییر یافت');
  };
  
  const handleResetPassword = (userId: string) => {
    // In real app, this would send a reset email or generate a temp password
    toast.success('رمز عبور بازنشانی شد و برای کاربر ارسال گردید');
  };
  
  const getRoleBadge = (role: string) => {
    const roleConfig = {
      'admin': { label: 'مدیر سیستم', variant: 'destructive' as const },
      'manager': { label: 'مدیر', variant: 'default' as const },
      'hr': { label: 'منابع انسانی', variant: 'secondary' as const },
      'seller': { label: 'فروشنده', variant: 'outline' as const }
    };
    
    const config = roleConfig[role as keyof typeof roleConfig];
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };
  
  const getPermissions = (role: string) => {
    const permissions = {
      'admin': 'دسترسی کامل به تمام بخش‌ها',
      'manager': 'مشاهده و تایید درخواست‌ها، مشاهده گزارش‌ها',
      'hr': 'مدیریت کارمندان، درخواست‌ها و حقوق',
      'seller': 'فقط بخش فروش'
    };
    
    return permissions[role as keyof typeof permissions];
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">تنظیمات</h1>
        <p className="text-muted-foreground">مدیریت تنظیمات حساب کاربری و سیستم</p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="profile">پروفایل</TabsTrigger>
          <TabsTrigger value="security">امنیت</TabsTrigger>
          <TabsTrigger value="notifications">اطلاع‌رسانی</TabsTrigger>
          <TabsTrigger value="appearance">ظاهر</TabsTrigger>
          <TabsTrigger value="users">مدیریت کاربران</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <Card>
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src="/avatars/admin.jpg" />
                <AvatarFallback className="text-lg">
                  <User className="w-8 h-8" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  اطلاعات پروفایل
                </CardTitle>
                <CardDescription>
                  مدیریت اطلاعات شخصی و تماس
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">نام و نام خانوادگی</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">ایمیل</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">شماره تماس</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                  />
                </div>
              </div>
              <Button onClick={handleProfileUpdate} className="w-full md:w-auto">
                بروزرسانی اطلاعات
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                تغییر رمز عبور
              </CardTitle>
              <CardDescription>
                رمز عبور جدید خود را وارد کنید
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">رمز عبور فعلی</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">رمز عبور جدید</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">تأیید رمز عبور جدید</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                </div>
              </div>
              <Button onClick={handlePasswordChange} variant="outline" className="w-full md:w-auto">
                تغییر رمز عبور
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {theme === 'dark' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                تنظیمات ظاهری
              </CardTitle>
              <CardDescription>
                انتخاب تم و ظاهر سیستم
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>حالت تاریک</Label>
                  <p className="text-sm text-muted-foreground">
                    تغییر به حالت تاریک یا روشن
                  </p>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                تنظیمات اطلاع‌رسانی
              </CardTitle>
              <CardDescription>
                مدیریت نحوه دریافت اطلاع‌رسانی‌ها
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>اطلاع‌رسانی ایمیل</Label>
                    <p className="text-sm text-muted-foreground">
                      دریافت اطلاع‌رسانی‌ها از طریق ایمیل
                    </p>
                  </div>
                  <Switch
                    checked={notifications.emailNotifications}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, emailNotifications: checked }))
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>اطلاع‌رسانی فوری</Label>
                    <p className="text-sm text-muted-foreground">
                      دریافت اطلاع‌رسانی‌های فوری در مرورگر
                    </p>
                  </div>
                  <Switch
                    checked={notifications.pushNotifications}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, pushNotifications: checked }))
                    }
                  />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>گزارش‌های هفتگی</Label>
                    <p className="text-sm text-muted-foreground">
                      دریافت گزارش خلاصه هفتگی فعالیت‌ها
                    </p>
                  </div>
                  <Switch
                    checked={notifications.weeklyReports}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, weeklyReports: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    مدیریت کاربران
                  </CardTitle>
                  <CardDescription>
                    ایجاد و مدیریت حساب‌های کاربری سیستم
                  </CardDescription>
                </div>
                
                <Dialog open={isUserDialogOpen} onOpenChange={(open) => {
                  setIsUserDialogOpen(open);
                  if (!open) {
                    setEditingUser(null);
                    userForm.reset();
                  }
                }}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 ml-2" />
                      کاربر جدید
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingUser ? 'ویرایش کاربر' : 'ایجاد کاربر جدید'}
                      </DialogTitle>
                      <DialogDescription>
                        {editingUser ? 'اطلاعات کاربر را ویرایش کنید' : 'اطلاعات کاربر جدید را وارد کنید'}
                      </DialogDescription>
                    </DialogHeader>
                    
                    <Form {...userForm}>
                      <form onSubmit={userForm.handleSubmit(handleCreateUser)} className="space-y-4">
                        <FormField
                          control={userForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>نام و نام خانوادگی</FormLabel>
                              <FormControl>
                                <Input placeholder="نام کامل کاربر" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={userForm.control}
                          name="mobile"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>شماره موبایل</FormLabel>
                              <FormControl>
                                <Input placeholder="09123456789" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={userForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>ایمیل</FormLabel>
                              <FormControl>
                                <Input type="email" placeholder="user@vashnia.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={userForm.control}
                          name="password"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {editingUser ? 'رمز عبور جدید (اختیاری)' : 'رمز عبور'}
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  type="password" 
                                  placeholder={editingUser ? "برای تغییر وارد کنید" : "رمز عبور"} 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={userForm.control}
                          name="role"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>نقش کاربری</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="انتخاب نقش" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="admin">مدیر سیستم</SelectItem>
                                  <SelectItem value="manager">مدیر</SelectItem>
                                  <SelectItem value="hr">منابع انسانی</SelectItem>
                                  <SelectItem value="seller">فروشنده</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end gap-2 pt-4">
                          <Button 
                            type="button" 
                            variant="outline"
                            onClick={() => setIsUserDialogOpen(false)}
                          >
                            انصراف
                          </Button>
                          <Button type="submit">
                            {editingUser ? 'به‌روزرسانی' : 'ایجاد کاربر'}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div 
                    key={user.id} 
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback>
                          <User className="w-4 h-4" />
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{user.name}</h4>
                          {getRoleBadge(user.role)}
                          {!user.isActive && (
                            <Badge variant="secondary" className="text-xs">
                              غیرفعال
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <p>{user.email}</p>
                          <p>{user.mobile}</p>
                          <p className="text-xs">{getPermissions(user.role)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditUser(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResetPassword(user.id)}
                      >
                        <RotateCcw className="w-4 h-4" />
                      </Button>
                      
                      <Button
                        variant={user.isActive ? "destructive" : "default"}
                        size="sm"
                        onClick={() => handleDeactivateUser(user.id)}
                      >
                        {user.isActive ? (
                          <Trash2 className="w-4 h-4" />
                        ) : (
                          <Plus className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
                
                {users.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    هیچ کاربری یافت نشد
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}