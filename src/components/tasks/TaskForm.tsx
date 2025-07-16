import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import PersianDatePicker from "@/components/PersianDatePicker";
import { toJalaliDisplay, jalaliToGregorian, toJalaliObject } from "@/utils/date";

interface Task {
  id: string;
  employeeName: string;
  description: string;
  assignedDate: string;
  dueDate: string;
  status: "pending" | "in-progress" | "completed";
  priority: "low" | "medium" | "high";
  department: string;
  attachments: File[];
  completedDate?: string;
}

const taskSchema = z.object({
  employeeName: z.string().min(1, "نام کارمند الزامی است"),
  description: z.string().min(1, "شرح وظیفه الزامی است"),
  assignedDate: z.string().min(1, "تاریخ تعیین الزامی است"),
  dueDate: z.string().min(1, "تاریخ تحویل الزامی است"),
  status: z.enum(["pending", "in-progress", "completed"]),
  priority: z.enum(["low", "medium", "high"]),
  department: z.string().min(1, "بخش الزامی است"),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  task?: Task | null;
  employees: string[];
  departments: string[];
  onSubmit: (data: Omit<Task, "id">) => void;
  onCancel: () => void;
}

export function TaskForm({ task, employees, departments, onSubmit, onCancel }: TaskFormProps) {
  const [attachments, setAttachments] = useState<File[]>(task?.attachments || []);
  
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      employeeName: task?.employeeName || "",
      description: task?.description || "",
      assignedDate: task?.assignedDate || "",
      dueDate: task?.dueDate || "",
      status: task?.status || "pending",
      priority: task?.priority || "medium",
      department: task?.department || "",
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const validTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/png'];
      const maxSize = 10 * 1024 * 1024; // 10MB
      return validTypes.includes(file.type) && file.size <= maxSize;
    });
    
    setAttachments(prev => [...prev, ...validFiles]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (data: TaskFormData) => {
    const submissionData: Omit<Task, "id"> = {
      ...data,
      attachments,
      ...(data.status === "completed" && !task?.completedDate && {
        completedDate: toJalaliDisplay(new Date())
      }),
    };
    onSubmit(submissionData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Employee Name */}
          <FormField
            control={form.control}
            name="employeeName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>نام کارمند *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب کارمند" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee} value={employee}>
                        {employee}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Department */}
          <FormField
            control={form.control}
            name="department"
            render={({ field }) => (
              <FormItem>
                <FormLabel>بخش *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب بخش" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Task Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>شرح وظیفه *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="شرح کاملی از وظیفه ارائه دهید..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Assigned Date */}
          <FormField
            control={form.control}
            name="assignedDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تاریخ تعیین *</FormLabel>
                <FormControl>
                  <PersianDatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="انتخاب تاریخ تعیین"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Due Date */}
          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>تاریخ تحویل *</FormLabel>
                <FormControl>
                  <PersianDatePicker
                    value={field.value}
                    onChange={field.onChange}
                    placeholder="انتخاب تاریخ تحویل"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status */}
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>وضعیت *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب وضعیت" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pending">در انتظار</SelectItem>
                    <SelectItem value="in-progress">در حال انجام</SelectItem>
                    <SelectItem value="completed">تکمیل شده</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Priority */}
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>اولویت *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب اولویت" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">کم</SelectItem>
                    <SelectItem value="medium">متوسط</SelectItem>
                    <SelectItem value="high">بالا</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* File Attachments */}
        <div className="space-y-4">
          <FormLabel>پیوست‌های فایل</FormLabel>
          <div className="border-2 border-dashed border-border rounded-lg p-6">
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
              <div className="mt-4">
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-foreground">
                    فایل‌های خود را انتخاب کنید
                  </span>
                  <span className="text-xs text-muted-foreground">
                    PDF, DOCX, JPG, PNG تا 10MB
                  </span>
                </label>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          </div>

          {/* Uploaded Files */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">فایل‌های آپلود شده:</h4>
              {attachments.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <span className="text-sm">{file.name}</span>
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
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6">
          <Button type="button" variant="outline" onClick={onCancel}>
            انصراف
          </Button>
          <Button type="submit">
            {task ? "بروزرسانی وظیفه" : "ایجاد وظیفه"}
          </Button>
        </div>
      </form>
    </Form>
  );
}