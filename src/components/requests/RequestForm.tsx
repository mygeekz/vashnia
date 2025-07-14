import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CalendarIcon, Upload, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { JalaliDatePicker } from '@/components/ui/jalali-date-picker';

const requestSchema = z.object({
  employeeName: z.string().min(1, 'نام کارمند الزامی است'),
  employeeId: z.string().min(1, 'شناسه کارمند الزامی است'),
  requestType: z.string().min(1, 'نوع درخواست الزامی است'),
  priority: z.string().min(1, 'اولویت الزامی است'),
  description: z.string().min(10, 'توضیحات باید حداقل ۱۰ کاراکتر باشد'),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  amount: z.number().optional(),
  reason: z.string().optional()
}).refine((data) => {
  if (data.requestType === 'مساعده مالی' && !data.amount) {
    return false;
  }
  if ((data.requestType === 'مرخصی زایمان' || data.requestType === 'مرخصی استعلاجی' || data.requestType === 'مرخصی استحقاقی') && (!data.startDate || !data.endDate)) {
    return false;
  }
  return true;
}, {
  message: 'فیلدهای مورد نیاز برای نوع درخواست انتخاب شده تکمیل نشده است'
});

type RequestFormData = z.infer<typeof requestSchema>;

interface RequestFormProps {
  onSubmit: (data: RequestFormData & { attachments: string[] }) => void;
  onCancel: () => void;
}

export const RequestForm: React.FC<RequestFormProps> = ({ onSubmit, onCancel }) => {
  const [attachments, setAttachments] = useState<string[]>([]);
  
  const form = useForm<RequestFormData>({
    resolver: zodResolver(requestSchema),
    defaultValues: {
      employeeName: '',
      employeeId: '',
      requestType: '',
      priority: 'medium',
      description: ''
    }
  });

  const watchedRequestType = form.watch('requestType');

  const handleSubmit = (data: RequestFormData) => {
    onSubmit({
      ...data,
      attachments
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newAttachments = Array.from(files).map(file => file.name);
      setAttachments(prev => [...prev, ...newAttachments]);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatPersianDate = (date: Date | undefined) => {
    if (!date) return "";
    return date.toLocaleDateString('fa-IR');
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6" dir="rtl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employee Information */}
          <Card>
            <CardHeader>
              <CardTitle>اطلاعات کارمند</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="employeeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نام و نام خانوادگی</FormLabel>
                    <FormControl>
                      <Input placeholder="نام کامل کارمند" {...field} />
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
                    <FormLabel>شناسه کارمند</FormLabel>
                    <FormControl>
                      <Input placeholder="EMP001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Request Details */}
          <Card>
            <CardHeader>
              <CardTitle>جزئیات درخواست</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="requestType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>نوع درخواست</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="نوع درخواست را انتخاب کنید" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="مرخصی زایمان">مرخصی زایمان</SelectItem>
                        <SelectItem value="مرخصی استعلاجی">مرخصی استعلاجی</SelectItem>
                        <SelectItem value="مرخصی استحقاقی">مرخصی استحقاقی</SelectItem>
                        <SelectItem value="مساعده مالی">مساعده مالی</SelectItem>
                        <SelectItem value="درخواست اداری">سایر درخواست‌های اداری</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>اولویت درخواست</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-row space-x-6"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="low" id="low" />
                          <Label htmlFor="low">کم</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="medium" id="medium" />
                          <Label htmlFor="medium">متوسط</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="high" id="high" />
                          <Label htmlFor="high">بالا</Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        </div>

        {/* Conditional Fields Based on Request Type */}
        {(watchedRequestType === 'مرخصی زایمان' || watchedRequestType === 'مرخصی استعلاجی' || watchedRequestType === 'مرخصی استحقاقی') && (
          <Card>
            <CardHeader>
              <CardTitle>تاریخ‌های مرخصی</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاریخ شروع مرخصی (شمسی)</FormLabel>
                      <FormControl>
                        <JalaliDatePicker
                          value={field.value ? field.value.toISOString() : ''}
                          onChange={(date) => field.onChange(new Date(date))}
                          placeholder="انتخاب تاریخ شروع"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>تاریخ پایان مرخصی (شمسی)</FormLabel>
                      <FormControl>
                        <JalaliDatePicker
                          value={field.value ? field.value.toISOString() : ''}
                          onChange={(date) => field.onChange(new Date(date))}
                          placeholder="انتخاب تاریخ پایان"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {watchedRequestType === 'مساعده مالی' && (
          <Card>
            <CardHeader>
              <CardTitle>اطلاعات مالی</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>مبلغ درخواستی (تومان)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="مبلغ را وارد کنید"
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>هدف از درخواست</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="هدف و دلیل درخواست مساعده مالی را شرح دهید"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>توضیحات درخواست</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>شرح کامل درخواست</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="توضیحات کامل درخواست خود را وارد کنید..."
                      className="min-h-24"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* File Attachments */}
        <Card>
          <CardHeader>
            <CardTitle>پیوست‌ها</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <Label htmlFor="file-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border border-dashed rounded-lg hover:bg-muted">
                  <Upload className="h-4 w-4" />
                  <span>افزودن فایل</span>
                </div>
              </Label>
              <Input
                id="file-upload"
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileUpload}
              />
            </div>

            {attachments.length > 0 && (
              <div className="space-y-2">
                <Label>فایل‌های پیوست شده:</Label>
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{file}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            انصراف
          </Button>
          <Button type="submit">
            ثبت درخواست
          </Button>
        </div>
      </form>
    </Form>
  );
};