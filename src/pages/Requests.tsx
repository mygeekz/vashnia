import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { RequestForm } from "@/components/requests/RequestForm";
import { RequestDetails } from "@/components/requests/RequestDetails";
import { RequestDashboard } from "@/components/requests/RequestDashboard";
import { Plus, Search, Filter, Download, Eye, Edit, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Request {
  id: string;
  employeeName: string;
  employeeId: string;
  requestType: string;
  status: 'pending' | 'under-review' | 'approved-manager' | 'rejected-manager' | 'approved-ceo' | 'rejected-ceo';
  priority: 'low' | 'medium' | 'high';
  submissionDate: string;
  startDate?: string;
  endDate?: string;
  amount?: number;
  description: string;
  attachments: string[];
  comments: Array<{
    author: string;
    role: string;
    comment: string;
    timestamp: string;
  }>;
  history: Array<{
    action: string;
    author: string;
    timestamp: string;
  }>;
}

const Requests = () => {
  const { toast } = useToast();
  const [requests, setRequests] = useState<Request[]>([
    {
      id: "REQ001",
      employeeName: "علی احمدی",
      employeeId: "EMP001",
      requestType: "مرخصی استعلاجی",
      status: "pending",
      priority: "high",
      submissionDate: "1404/03/15",
      startDate: "1404/03/20",
      endDate: "1404/03/25",
      description: "مرخصی استعلاجی برای عمل جراحی",
      attachments: ["medical-certificate.pdf"],
      comments: [],
      history: [
        {
          action: "درخواست ثبت شد",
          author: "علی احمدی",
          timestamp: "1404/03/15 09:30"
        }
      ]
    },
    {
      id: "REQ002",
      employeeName: "فاطمه کریمی",
      employeeId: "EMP002",
      requestType: "مرخصی زایمان",
      status: "approved-manager",
      priority: "high",
      submissionDate: "1404/03/10",
      startDate: "1404/04/01",
      endDate: "1404/07/01",
      description: "مرخصی زایمان",
      attachments: ["pregnancy-certificate.pdf"],
      comments: [
        {
          author: "مدیر منابع انسانی",
          role: "admin",
          comment: "مدارک تایید شد",
          timestamp: "1404/03/12 14:20"
        }
      ],
      history: [
        {
          action: "درخواست ثبت شد",
          author: "فاطمه کریمی", 
          timestamp: "1404/03/10 10:15"
        },
        {
          action: "تایید مدیر",
          author: "مدیر واحد",
          timestamp: "1404/03/12 16:30"
        }
      ]
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [userRole] = useState<'employee' | 'admin' | 'manager' | 'ceo'>('admin');

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'pending': { label: 'در انتظار', variant: 'secondary' as const },
      'under-review': { label: 'در حال بررسی', variant: 'default' as const },
      'approved-manager': { label: 'تایید مدیر', variant: 'default' as const },
      'rejected-manager': { label: 'رد مدیر', variant: 'destructive' as const },
      'approved-ceo': { label: 'تایید نهایی', variant: 'default' as const },
      'rejected-ceo': { label: 'رد نهایی', variant: 'destructive' as const }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig = {
      'low': { label: 'کم', variant: 'outline' as const },
      'medium': { label: 'متوسط', variant: 'secondary' as const },
      'high': { label: 'بالا', variant: 'destructive' as const }
    };
    
    const config = priorityConfig[priority as keyof typeof priorityConfig];
    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.employeeName.includes(searchTerm) || 
                         request.requestType.includes(searchTerm) ||
                         request.id.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesType = typeFilter === "all" || request.requestType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleCreateRequest = (requestData: any) => {
    const newRequest: Request = {
      id: `REQ${String(requests.length + 1).padStart(3, '0')}`,
      ...requestData,
      status: 'pending' as const,
      submissionDate: new Date().toLocaleDateString('fa-IR'),
      comments: [],
      history: [
        {
          action: "درخواست ثبت شد",
          author: requestData.employeeName,
          timestamp: new Date().toLocaleString('fa-IR')
        }
      ]
    };
    
    setRequests([...requests, newRequest]);
    setIsFormOpen(false);
    
    toast({
      title: "درخواست ثبت شد",
      description: `درخواست ${newRequest.id} با موفقیت ثبت شد`,
    });
  };

  const handleUpdateRequestStatus = (requestId: string, newStatus: string, comment?: string) => {
    setRequests(prev => prev.map(request => {
      if (request.id === requestId) {
        const updatedComments = comment ? [
          ...request.comments,
          {
            author: "کاربر فعلی",
            role: userRole,
            comment,
            timestamp: new Date().toLocaleString('fa-IR')
          }
        ] : request.comments;
        
        const updatedHistory = [
          ...request.history,
          {
            action: `وضعیت به ${newStatus} تغییر یافت`,
            author: "کاربر فعلی",
            timestamp: new Date().toLocaleString('fa-IR')
          }
        ];
        
        return {
          ...request,
          status: newStatus as any,
          comments: updatedComments,
          history: updatedHistory
        };
      }
      return request;
    }));
    
    toast({
      title: "وضعیت به‌روزرسانی شد",
      description: "وضعیت درخواست با موفقیت به‌روزرسانی شد",
    });
  };

  const exportRequests = () => {
    const dataStr = JSON.stringify(filteredRequests, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `requests-${new Date().toLocaleDateString('fa-IR')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    toast({
      title: "فایل دانلود شد",
      description: "درخواست‌ها با موفقیت دانلود شدند",
    });
  };

  return (
    <div className="container mx-auto p-6 space-y-6" dir="rtl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">مدیریت درخواست‌های کارمندان</h1>
          <p className="text-muted-foreground">مدیریت و پیگیری درخواست‌های کارمندان</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={exportRequests} variant="outline">
            <Download className="h-4 w-4 ml-2" />
            دانلود گزارش
          </Button>
          
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 ml-2" />
                درخواست جدید
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>ثبت درخواست جدید</DialogTitle>
                <DialogDescription>
                  فرم زیر را برای ثبت درخواست جدید تکمیل کنید
                </DialogDescription>
              </DialogHeader>
              <RequestForm onSubmit={handleCreateRequest} onCancel={() => setIsFormOpen(false)} />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="all-requests" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all-requests">همه درخواست‌ها</TabsTrigger>
          <TabsTrigger value="dashboard">داشبورد</TabsTrigger>
          <TabsTrigger value="pending">در انتظار</TabsTrigger>
          <TabsTrigger value="completed">تکمیل شده</TabsTrigger>
        </TabsList>

        <TabsContent value="all-requests" className="space-y-4">
          {/* Search and Filter Section */}
          <Card>
            <CardHeader>
              <CardTitle>جستجو و فیلتر</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute right-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="جستجو در درخواست‌ها..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-8"
                  />
                </div>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="وضعیت" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه وضعیت‌ها</SelectItem>
                    <SelectItem value="pending">در انتظار</SelectItem>
                    <SelectItem value="under-review">در حال بررسی</SelectItem>
                    <SelectItem value="approved-manager">تایید مدیر</SelectItem>
                    <SelectItem value="rejected-manager">رد مدیر</SelectItem>
                    <SelectItem value="approved-ceo">تایید نهایی</SelectItem>
                    <SelectItem value="rejected-ceo">رد نهایی</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="نوع درخواست" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">همه انواع</SelectItem>
                    <SelectItem value="مرخصی زایمان">مرخصی زایمان</SelectItem>
                    <SelectItem value="مرخصی استعلاجی">مرخصی استعلاجی</SelectItem>
                    <SelectItem value="مرخصی استحقاقی">مرخصی استحقاقی</SelectItem>
                    <SelectItem value="مساعده مالی">مساعده مالی</SelectItem>
                    <SelectItem value="درخواست اداری">درخواست اداری</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button variant="outline" onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setTypeFilter("all");
                }}>
                  <Filter className="h-4 w-4 ml-2" />
                  پاک کردن فیلترها
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Requests List */}
          <div className="grid gap-4">
            {filteredRequests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-4">
                        <h3 className="font-semibold text-lg">{request.requestType}</h3>
                        {getStatusBadge(request.status)}
                        {getPriorityBadge(request.priority)}
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">شماره درخواست:</span>
                          <p>{request.id}</p>
                        </div>
                        <div>
                          <span className="font-medium">کارمند:</span>
                          <p>{request.employeeName}</p>
                        </div>
                        <div>
                          <span className="font-medium">تاریخ ثبت:</span>
                          <p>{request.submissionDate}</p>
                        </div>
                        <div>
                          <span className="font-medium">مدت:</span>
                          <p>{request.startDate && request.endDate ? `${request.startDate} - ${request.endDate}` : 'نامشخص'}</p>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {request.description}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 mr-4">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedRequest(request)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>جزئیات درخواست {request.id}</DialogTitle>
                          </DialogHeader>
                          <RequestDetails 
                            request={request} 
                            onUpdateStatus={handleUpdateRequestStatus}
                            userRole={userRole}
                          />
                        </DialogContent>
                      </Dialog>
                      
                      {(userRole === 'admin' || userRole === 'manager' || userRole === 'ceo') && (
                        <Button variant="outline" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {filteredRequests.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-muted-foreground">هیچ درخواستی یافت نشد</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="dashboard">
          <RequestDashboard requests={requests} userRole={userRole} />
        </TabsContent>

        <TabsContent value="pending">
          <div className="grid gap-4">
            {requests.filter(r => r.status === 'pending' || r.status === 'under-review').map((request) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{request.requestType}</h3>
                      <p className="text-sm text-muted-foreground">{request.employeeName} - {request.submissionDate}</p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="completed">
          <div className="grid gap-4">
            {requests.filter(r => r.status.includes('approved') || r.status.includes('rejected')).map((request) => (
              <Card key={request.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold">{request.requestType}</h3>
                      <p className="text-sm text-muted-foreground">{request.employeeName} - {request.submissionDate}</p>
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Requests;