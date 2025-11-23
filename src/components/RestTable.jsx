import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function RestTable({ rests, onEdit, onDelete, onTogglePaid }) {
    if (rests.length === 0) {
        return <div className="text-center p-8 text-gray-500">কোনো তথ্য পাওয়া যায়নি।</div>;
    }

    return (
        <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto rounded-lg border shadow-sm">
                <table className="w-full text-sm text-left">
                    <thead className="bg-gray-50 text-gray-700 uppercase text-xs">
                        <tr>
                            <th className="px-6 py-3">নাম</th>
                            <th className="px-6 py-3">টাকা</th>
                            <th className="px-6 py-3">বিবরণ</th>
                            <th className="px-6 py-3">তারিখ</th>
                            <th className="px-6 py-3">মোবাইল</th>
                            <th className="px-6 py-3">পরিশোধ</th>
                            <th className="px-6 py-3 text-right">কাজ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rests.map((rest) => (
                            <tr key={rest.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-6 py-4 font-medium text-gray-900">{rest.name}</td>
                                <td className="px-6 py-4">৳{rest.amount}</td>
                                <td className="px-6 py-4">{rest.items || "-"}</td>
                                <td className="px-6 py-4">{rest.date}</td>
                                <td className="px-6 py-4">{rest.mobile || "-"}</td>
                                <td className="px-6 py-4">
                                    <button
                                        onClick={() => onTogglePaid(rest)}
                                        className={`px-2 py-1 rounded text-xs font-semibold ${rest.paid
                                            ? "bg-green-100 text-green-800"
                                            : "bg-yellow-100 text-yellow-800"
                                            }`}
                                    >
                                        {rest.paid ? "পরিশোধিত" : "বাকি"}
                                    </button>
                                </td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onTogglePaid(rest)}
                                        className={rest.paid ? "text-yellow-600 hover:text-yellow-700" : "text-green-600 hover:text-green-700"}
                                    >
                                        {rest.paid ? "বাকি" : "পরিশোধিত"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onEdit(rest)}
                                    >
                                        এডিট
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => onDelete(rest.id)}
                                    >
                                        মুছুন
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
                {rests.map((rest) => (
                    <div key={rest.id} className="bg-white rounded-lg border shadow-sm p-4">
                        {/* Header with Name and Amount */}
                        <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 text-base">{rest.name}</h3>
                                <p className="text-xl font-bold text-primary mt-1">৳{rest.amount}</p>
                            </div>
                            <button
                                onClick={() => onTogglePaid(rest)}
                                className={`px-2 py-1 rounded text-xs font-semibold ${rest.paid
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                    }`}
                            >
                                {rest.paid ? "পরিশোধিত" : "বাকি"}
                            </button>
                        </div>

                        {/* Details Grid */}
                        <div className="space-y-2 mb-3 text-sm">
                            {rest.items && (
                                <div className="flex">
                                    <span className="text-gray-500 w-20">বিবরণ:</span>
                                    <span className="text-gray-900 flex-1">{rest.items}</span>
                                </div>
                            )}
                            <div className="flex">
                                <span className="text-gray-500 w-20">তারিখ:</span>
                                <span className="text-gray-900">{rest.date}</span>
                            </div>
                            {rest.mobile && (
                                <div className="flex">
                                    <span className="text-gray-500 w-20">মোবাইল:</span>
                                    <span className="text-gray-900">{rest.mobile}</span>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-3 border-t">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onTogglePaid(rest)}
                                className={`flex-1 text-xs ${rest.paid ? "text-yellow-600 hover:text-yellow-700" : "text-green-600 hover:text-green-700"}`}
                            >
                                {rest.paid ? "বাকি" : "পরিশোধিত"}
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEdit(rest)}
                                className="flex-1 text-xs"
                            >
                                এডিট
                            </Button>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => onDelete(rest.id)}
                                className="flex-1 text-xs"
                            >
                                মুছুন
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
