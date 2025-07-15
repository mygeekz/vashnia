import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { faIR } from 'date-fns/locale';
import { 
  Calendar as CalendarIcon, 
  Upload, 
  User, 
  ArrowRight,
  Save,
  X,
  Plus,
  Download,
  Printer,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Trash2,
  DollarSign,
  Building
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { numberToPersianText, formatCurrency, formatNumber } from '@/lib/number-to-persian';
import PersianDatePicker from '@/components/PersianDatePicker';

// Form validation schema
const addEmployeeSchema = z.object({
  fullName: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
  nationalId: z.string().regex(/^\d{10}$/, 'کد ملی باید ۱۰ رقم باشد'),
  employeeId: z.string().min(3, 'کد کارمندی باید حداقل ۳ کاراکتر باشد'),
  username: z.string().min(3, 'نام کاربری باید حداقل ۳ کاراکتر باشد'),
  jobTitle: z.string().min(2, 'سمت باید حداقل ۲ کاراکتر باشد'),
  department: z.string().min(1, 'انتخاب بخش اجباری است'),
  branch: z.string().min(1, 'انتخاب شعبه اجباری است'),
  contactNumber: z.string().regex(/^09\d{9}$/, 'شماره موبایل معتبر وارد کنید'),
  email: z.string().email('ایمیل معتبر وارد کنید'),
  dateOfJoining: z.string().min(1, 'تاریخ استخدام اجباری است'),
  monthlySalary: z.number().min(1, 'مبلغ حقوق باید بیشتر از صفر باشد'),
  status: z.enum(['active', 'inactive']),
  gender: z.enum(['male', 'female'], {
    message: 'انتخاب جنسیت اجباری است'
  }),
  additionalNotes: z.string().optional(),
  tasks: z.array(z.object({
    title: z.string().min(1, 'عنوان وظیفه اجباری است'),
    description: z.string().min(1, 'توضیحات وظیفه اجباری است'),
    status: z.enum(['pending', 'in_progress', 'completed']),
    assignedDate: z.string().min(1, 'تاریخ تخصیص اجباری است'),
    dueDate: z.string().optional(),
  })).optional(),
});

type AddEmployeeForm = z.infer<typeof addEmployeeSchema>;

type FileAttachment = {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadDate: Date;
};

export default function AddEmployee() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);
  const [fileAttachments, setFileAttachments] = useState<FileAttachment[]>([]);

  const form = useForm<AddEmployeeForm>({
    resolver: zodResolver(addEmployeeSchema),
    defaultValues: {
      fullName: '',
      nationalId: '',
      employeeId: '',
      username: '',
      jobTitle: '',
      department: '',
      branch: '',
      contactNumber: '',
      email: '',
      monthlySalary: 0,
      status: 'active',
      gender: 'male' as const,
      additionalNotes: '',
      tasks: [],
      dateOfJoining: '',
    },
  });

  // Field array for tasks management
  const { fields: taskFields, append: appendTask, remove: removeTask } = useFieldArray({
    control: form.control,
    name: 'tasks',
  });


  const onSubmit = async (data: AddEmployeeForm) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Employee data:', data);
      console.log('Photo file:', photoFile);
      console.log('Document files:', documentFiles);
      console.log('File attachments:', fileAttachments);
      
      toast({
        title: "موفقیت",
        description: "کارمند جدید با موفقیت اضافه شد",
      });
      
      navigate('/employees');
    } catch (error) {
      toast({
        title: "خطا",
        description: "مشکلی در ثبت اطلاعات رخ داده است",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "خطا",
          description: "حجم فایل باید کمتر از ۵ مگابایت باشد",
          variant: "destructive"
        });
        return;
      }
      setPhotoFile(file);
    }
  };

  const handleDocumentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newAttachments: FileAttachment[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      type: file.type,
      size: file.size,
      url: URL.createObjectURL(file),
      uploadDate: new Date(),
    }));
    
    setDocumentFiles(prev => [...prev, ...files]);
    setFileAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeDocument = (index: number) => {
    setDocumentFiles(prev => prev.filter((_, i) => i !== index));
    setFileAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const downloadFile = (attachment: FileAttachment) => {
    const link = document.createElement('a');
    link.href = attachment.url;
    link.download = attachment.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "دانلود فایل",
      description: `فایل ${attachment.name} دانلود شد`,
    });
  };

  const printFile = (attachment: FileAttachment) => {
    if (attachment.type.includes('image') || attachment.type.includes('pdf')) {
      const printWindow = window.open(attachment.url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }
      
      toast({
        title: "چاپ فایل",
        description: `فایل ${attachment.name} آماده چاپ است`,
      });
    } else {
      toast({
        title: "خطا",
        description: "فقط فایل‌های تصویری و PDF قابل چاپ هستند",
        variant: "destructive"
      });
    }
  };

  const addNewTask = () => {
    appendTask({
      title: '',
      description: '',
      status: 'pending',
      assignedDate: '',
      dueDate: '',
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'تکمیل شده';
      case 'in_progress':
        return 'در حال انجام';
      default:
        return 'در انتظار';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">افزودن کارمند جدید</h1>
          <p className="text-muted-foreground">
            اطلاعات کارمند جدید را وارد کنید
          </p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={() => navigate('/employees')}
          className="gap-2"
        >
          <ArrowRight className="w-4 h-4" />
          بازگشت به لیست
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                اطلاعات شخصی
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام و نام خانوادگی *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="نام و نام خانوادگی کارمند"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nationalId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>کد ملی *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="1234567890"
                        {...field}
                        disabled={isLoading}
                        maxLength={10}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employeeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>کد کارمندی *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="EMP001"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام کاربری *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="username"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>شماره تماس *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="09123456789"
                        {...field}
                        disabled={isLoading}
                      />
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
                      <Input 
                        type="email"
                        placeholder="example@vashnia.com"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>جنسیت *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex gap-6"
                        disabled={isLoading}
                      >
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <RadioGroupItem value="male" id="male" />
                          <Label htmlFor="male">مرد</Label>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <RadioGroupItem value="female" id="female" />
                          <Label htmlFor="female">زن</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

            </CardContent>
          </Card>

          {/* Employment Details */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle>جزئیات استخدام</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>سمت *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="مدیر فروش"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>بخش *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب بخش" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card">
                        <SelectItem value="sales">فروش</SelectItem>
                        <SelectItem value="finance">مالی</SelectItem>
                        <SelectItem value="hr">منابع انسانی</SelectItem>
                        <SelectItem value="technical">فنی</SelectItem>
                        <SelectItem value="operations">عملیات</SelectItem>
                        <SelectItem value="marketing">بازاریابی</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="branch"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>شعبه کاری *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      disabled={isLoading}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب شعبه" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-card">
                        <SelectItem value="central">دفتر مرکزی</SelectItem>
                        <SelectItem value="north">شعبه شمال</SelectItem>
                        <SelectItem value="south">شعبه جنوب</SelectItem>
                        <SelectItem value="east">شعبه شرق</SelectItem>
                        <SelectItem value="west">شعبه غرب</SelectItem>
                        <SelectItem value="tehran">شعبه تهران</SelectItem>
                        <SelectItem value="isfahan">شعبه اصفهان</SelectItem>
                        <SelectItem value="shiraz">شعبه شیراز</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dateOfJoining"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاریخ استخدام (شمسی) *</FormLabel>
                    <FormControl>
                      <PersianDatePicker
                        value={field.value}
                        onChange={field.onChange}
                        placeholder="انتخاب تاریخ استخدام"
                        disabled={isLoading}
                        required
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>وضعیت *</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        value={field.value}
                        className="flex gap-6"
                        disabled={isLoading}
                      >
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <RadioGroupItem value="active" id="active" />
                          <Label htmlFor="active">فعال</Label>
                        </div>
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <RadioGroupItem value="inactive" id="inactive" />
                          <Label htmlFor="inactive">غیرفعال</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Salary Information */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                اطلاعات حقوق و دستمزد
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-6">
              <FormField
                control={form.control}
                name="monthlySalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>میزان حقوق ماهانه (تومان) *</FormLabel>
                    <FormControl>
                      <Input 
                        type="number"
                        placeholder="10000000"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        disabled={isLoading}
                        min="0"
                      />
                    </FormControl>
                    {field.value > 0 && (
                      <div className="mt-2 p-3 bg-primary/10 rounded-lg">
                        <p className="text-sm text-primary font-medium">
                          معادل حروفی: {formatCurrency(field.value)}
                        </p>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="additionalNotes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>توضیحات و اطلاعات اضافی</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="اطلاعات اضافی درباره کارمند، تخصص‌ها، سابقه کار و سایر موارد..."
                        {...field}
                        disabled={isLoading}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Employee Tasks Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  وظایف و مسئولیت‌های کارمند
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addNewTask}
                  disabled={isLoading}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  افزودن وظیفه
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {taskFields?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>هنوز وظیفه‌ای تعریف نشده است</p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addNewTask}
                    disabled={isLoading}
                    className="mt-2"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    اولین وظیفه را اضافه کنید
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {taskFields?.map((task, index) => (
                    <Card key={task.id} className="border border-border/50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <h4 className="text-sm font-medium">وظیفه {index + 1}</h4>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeTask(index)}
                            disabled={isLoading}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`tasks.${index}.title`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>عنوان وظیفه</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="عنوان وظیفه"
                                    {...field}
                                    disabled={isLoading}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`tasks.${index}.status`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>وضعیت</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  value={field.value}
                                  disabled={isLoading}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="انتخاب وضعیت" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent className="bg-card">
                                    <SelectItem value="pending">
                                      <div className="flex items-center gap-2">
                                        <AlertCircle className="w-4 h-4 text-red-500" />
                                        در انتظار
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="in_progress">
                                      <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-yellow-500" />
                                        در حال انجام
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="completed">
                                      <div className="flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                        تکمیل شده
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`tasks.${index}.description`}
                            render={({ field }) => (
                              <FormItem className="md:col-span-2">
                                <FormLabel>توضیحات وظیفه</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="توضیحات کامل وظیفه..."
                                    {...field}
                                    disabled={isLoading}
                                    rows={3}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`tasks.${index}.assignedDate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>تاریخ تخصیص</FormLabel>
                                <FormControl>
                                  <PersianDatePicker
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="انتخاب تاریخ تخصیص"
                                    disabled={isLoading}
                                    required
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <FormField
                            control={form.control}
                            name={`tasks.${index}.dueDate`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>مهلت انجام (اختیاری)</FormLabel>
                                <FormControl>
                                  <PersianDatePicker
                                    value={field.value}
                                    onChange={field.onChange}
                                    placeholder="انتخاب مهلت انجام"
                                    disabled={isLoading}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Enhanced File Attachments Section */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                مدارک و فایل‌های ضمیمه
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Employee Photo */}
              <div>
                <Label className="text-sm font-medium">تصویر کارمند</Label>
                <div className="mt-2 flex items-center gap-4">
                  <div className="w-20 h-20 bg-secondary rounded-lg flex items-center justify-center">
                    {photoFile ? (
                      <img 
                        src={URL.createObjectURL(photoFile)} 
                        alt="Preview" 
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <User className="w-8 h-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                      id="photo-upload"
                      disabled={isLoading}
                    />
                    <Label 
                      htmlFor="photo-upload" 
                      className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                    >
                      <Upload className="w-4 h-4" />
                      انتخاب تصویر
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      حداکثر ۵ مگابایت - فرمت JPG، PNG
                    </p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <Label className="text-sm font-medium">مدارک (قرارداد، رزومه، کارت ملی، گواهینامه‌ها و غیره)</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={handleDocumentChange}
                    className="hidden"
                    id="documents-upload"
                    disabled={isLoading}
                  />
                  <Label 
                    htmlFor="documents-upload" 
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    انتخاب فایل‌ها
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    فرمت PDF، Word، تصاویر - چندین فایل قابل انتخاب
                  </p>

                  {/* Enhanced Document List with Download/Print */}
                  {fileAttachments.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <h4 className="text-sm font-medium">فایل‌های ضمیمه شده:</h4>
                      {fileAttachments.map((attachment, index) => (
                        <div key={attachment.id} className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border border-border/50">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <FileText className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium truncate">{attachment.name}</p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>{(attachment.size / 1024 / 1024).toFixed(2)} MB</span>
                                <span>{format(attachment.uploadDate, "PPP", { locale: faIR })}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadFile(attachment)}
                              disabled={isLoading}
                              title="دانلود فایل"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => printFile(attachment)}
                              disabled={isLoading}
                              title="چاپ فایل"
                            >
                              <Printer className="w-4 h-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDocument(index)}
                              disabled={isLoading}
                              title="حذف فایل"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/employees')}
                  disabled={isLoading}
                  className="order-2 sm:order-1"
                >
                  انصراف
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-primary hover:opacity-90 order-1 sm:order-2"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"></div>
                      در حال ذخیره...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-4 h-4" />
                      ذخیره کارمند
                    </div>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}