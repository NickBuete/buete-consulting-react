"use client";

import React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from './Button';
import { 
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage
} from './Form';
import { Input } from './Input';
import { Textarea } from './Textarea';
import { 
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from './Select';

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be at most 50 characters"),
    email: z.string().email("Invalid email address"),
    practiceType: z.string().min(1, "Please select a practice type"),
    message: z.string().min(10, "Message must be at least 10 characters").max(1000, "Message must be at most 1000 characters"),
});

type FormData = z.infer<typeof formSchema>;

interface ContactFormProps {
    title?: string;
    onSubmit?: (data: FormData) => void;
}

const ContactForm: React.FC<ContactFormProps> = ({
    title = "Send us a message",
    onSubmit
}) => {
    const form = useForm<FormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            email: '',
            practiceType: '',
            message: ''
        }
    });

    return (
        <div className="bg-white">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
            {/* Form here */}
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit || (() => {}))} className="space-y-6">
                    {/* Name Field */}
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Your full name" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Email Field */}
                    <FormField 
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                    <Input type="email" placeholder="Your email address" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Practice Type Field */}
                    <FormField 
                        control={form.control}
                        name="practiceType"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Practice Type</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select your practice type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="community-pharmacy">Community Pharmacy</SelectItem>
                                        <SelectItem value="clinical-pharmacist">Clinical Pharmacist</SelectItem>
                                        <SelectItem value="compounding-pharmacy">Compounding Pharmacy</SelectItem>
                                        <SelectItem value="hospital-pharmacy">Hospital Pharmacy</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {/* Message Field */}
                    <FormField 
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Your Message</FormLabel>
                                <FormControl>
                                    <Textarea
                                        placeholder="Tell us about your project or questions..."
                                        className="min-h-[120px]"
                                        {...field}
                                    />
                                </FormControl>
                                <FormMessage />
                            </FormItem> 
                        )}
                    />
                    {/* Submit Button */}
                    <Button type="submit" className="w-full">
                        Send Message
                    </Button>
                </form>
            </Form>

        </div>
    );
};

export default ContactForm;