import { useEffect, useState } from 'react';
import { KpiCard } from '@/components/ui/dashboard/KpiCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/lib/auth';
import { 
  Users, 
  CheckCircle, 
  Clock, 
  Activity,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns-jalali';

// تابع برای دریافت داده‌ها از API
const fetchDashboardStats = async () => {
  const response = await fetch('/api/dashboard/stats');
  if (!response.ok) {
    throw new Error('خطا در ارتباط با سرور');
  }
  return response.json();
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: fetchDashboardStats,
  });

  // نمایش حالت لودینگ
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // نمایش حالت خطا
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg bg-red-50 p-8 text-red-600">
        <AlertCircle className="h-12 w-12" />
        <h2 className="mt-4 text-xl font-bold">خطا در بارگذاری داشبورد</h2>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 md:p-8 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg">
      {/* بخش خوش‌آمدگویی */}
      <div className="bg-white rounded-xl p-6 shadow-lg transform transition-all hover:scale-105 duration-500">
        <h1 className="text-3xl font-semibold text-gray-700">خوش آمدید، {user?.fullName || 'کاربر'}!</h1>
        <p className="text-gray-500">در اینجا خلاصه‌ای از فعالیت‌های سیستم شما آمده است.</p>
      </div>

      {/* کارت‌های آمار کلیدی */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {/* فقط کارت‌های KPI برای نمایش آمار کلیدی */}
        <KpiCard
          title="کل کارکنان"
          value={data?.totalEmployees ?? 0}
          icon={Users}
          className="animate-fade-in transform transition-all hover:scale-105 duration-500"
        />
        <KpiCard
          title="وظایف تکمیل شده"
          value={data?.completedTasks ?? 0}
          icon={CheckCircle}
          className="animate-fade-in transform transition-all hover:scale-105 duration-500"
        />
        <KpiCard
          title="وظایف در انتظار"
          value={data?.pendingTasks ?? 0}
          icon={Clock}
          className="animate-fade-in transform transition-all hover:scale-105 duration-500"
        />
      </div>

      {/* بخش فعالیت‌های اخیر و اقدامات سریع */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-white shadow-md rounded-lg transform transition-all hover:scale-105 duration-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-semibold text-gray-700">
              <Calendar className="h-5 w-5 text-blue-500" />
              فعالیت‌های اخیر
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data?.recentActivities?.length > 0 ? (
              data.recentActivities.map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg shadow-sm">
                  <Activity className="h-5 w-5 text-indigo-500" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{activity.title}</p>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">فعالیت اخیری ثبت نشده است.</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white shadow-md rounded-lg transform transition-all hover:scale-105 duration-500">
          <CardHeader>
            <CardTitle>عملیات سریع</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col space-y-3">
            <Button onClick={() => navigate('/employees/add')} variant="outline">
              <Users className="ml-2 h-4 w-4" /> افزودن کارمند
            </Button>
            <Button onClick={() => navigate('/tasks')} variant="outline">
              <CheckCircle className="ml-2 h-4 w-4" /> مدیریت وظایف
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// کامپوننت اسکلت برای نمایش در زمان لودینگ
const DashboardSkeleton = () => (
  <div className="space-y-6 p-4 md:p-6 bg-gradient-to-r from-blue-100 to-green-100 rounded-lg">
    <Skeleton className="h-36 w-full rounded-lg" />
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <Skeleton className="h-32 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
      <Skeleton className="h-32 rounded-lg" />
    </div>
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Skeleton className="h-64 rounded-lg lg:col-span-2" />
      <Skeleton className="h-64 rounded-lg" />
    </div>
  </div>
);
