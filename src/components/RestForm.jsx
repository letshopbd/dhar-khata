import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { cn } from "@/lib/utils";

export default function RestForm({ initialData, onSubmit, title, className }) {
    const [formData, setFormData] = useState({
        name: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        mobile: "",
        items: "",
        paid: false,
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
        }
    }, [initialData]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await onSubmit({
                ...formData,
                amount: parseFloat(formData.amount),
            });
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className={cn("w-full max-w-md mx-auto", className)}>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label htmlFor="name">নাম</label>
                        <Input
                            id="name"
                            name="name"
                            placeholder="নাম লিখুন"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="amount">টাকার পরিমাণ</label>
                        <Input
                            id="amount"
                            name="amount"
                            type="number"
                            placeholder="টাকার পরিমাণ লিখুন"
                            value={formData.amount}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="items">বিবরণ (কি কি নিয়েছে)</label>
                        <Textarea
                            id="items"
                            name="items"
                            placeholder="কি কি নিয়েছে লিখুন"
                            value={formData.items || ""}
                            onChange={handleChange}
                            className="min-h-[100px]"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="date">তারিখ</label>
                        <Input
                            id="date"
                            name="date"
                            type="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="mobile">মোবাইল (ঐচ্ছিক)</label>
                        <Input
                            id="mobile"
                            name="mobile"
                            placeholder="মোবাইল নম্বর লিখুন"
                            value={formData.mobile}
                            onChange={handleChange}
                        />
                    </div>

                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
