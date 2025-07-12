import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
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
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Form validation schema
const addEmployeeSchema = z.object({
  fullName: z.string().min(2, 'نام باید حداقل ۲ کاراکتر باشد'),
  employeeId: z.string().min(3, 'کد کارمندی باید حداقل ۳ کاراکتر باشد'),
  jobTitle: z.string().min(2, 'سمت باید حداقل ۲ کاراکتر باشد'),
  department: z.string().min(1, 'انتخاب بخش اجباری است'),
  contactNumber: z.string().regex(/^09\d{9}$/, 'شماره موبایل معتبر وارد کنید'),
  email: z.string().email('ایمیل معتبر وارد کنید'),
  dateOfJoining: z.date(),
  status: z.enum(['active', 'inactive']),
  gender: z.string().min(1, 'انتخاب جنسیت اجباری است'),
});

type AddEmployeeForm = z.infer<typeof addEmployeeSchema>;

export default function AddEmployee() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [documentFiles, setDocumentFiles] = useState<File[]>([]);

  const form = useForm<AddEmployeeForm>({
    resolver: zodResolver(addEmployeeSchema),
    defaultValues: {
      fullName: '',
      employeeId: '',
      jobTitle: '',
      department: '',
      contactNumber: '',
      email: '',
      status: 'active',
      gender: '',
    },
  });

  const onSubmit = async (data: AddEmployeeForm) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Employee data:', data);
      console.log('Photo file:', photoFile);
      console.log('Document files:', documentFiles);
      
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
    setDocumentFiles(prev => [...prev, ...files]);
  };

  const removeDocument = (index: number) => {
    setDocumentFiles(prev => prev.filter((_, i) => i !== index));
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
                  <FormItem className="md:col-span-2">
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
                        <div className="flex items-center space-x-2 space-x-reverse">
                          <RadioGroupItem value="other" id="other" />
                          <Label htmlFor="other">سایر</Label>
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
                name="dateOfJoining"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>تاریخ استخدام *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-right font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                            disabled={isLoading}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP", { locale: faIR })
                            ) : (
                              <span>انتخاب تاریخ</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) =>
                            date > new Date() || date < new Date("1900-01-01")
                          }
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
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

          {/* File Uploads */}
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="w-5 h-5" />
                آپلود فایل‌ها
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
                <Label className="text-sm font-medium">مدارک (رزومه، کارت ملی، و غیره)</Label>
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
                    فرمت PDF، Word، تصاویر
                  </p>

                  {/* Document List */}
                  {documentFiles.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {documentFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                          <span className="text-sm truncate">{file.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeDocument(index)}
                            disabled={isLoading}
                          >
                            <X className="w-4 h-4" />
                          </Button>
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