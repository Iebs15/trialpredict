import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { getUserData } from "@/lib/db";
import { Pencil, Download, Trash } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";

export default function SavedReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();
  const navigate = useNavigate();

  const handleDownload = async (report) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}:6005/download-report`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ file_link: report.file_link }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to download report.");
      }
  
      const blob = await response.blob();
  
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = report.filename || "report.docx";
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("❌ Error downloading file:", error);
    }
  };
  

  const handleDelete = async (report) => {
    try {
      const userData = await getUserData("user_salescout_id");
      const uuid = userData?.value;

      const res = await fetch(
        `${import.meta.env.VITE_API_URL}:6005/delete-report`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            report_id: report.id,
            file_link: report.file_link,
            uuid: uuid,
          }),
        }
      );

      if (!res.ok) throw new Error("Failed to delete report.");

      toast({
        title: "Report deleted",
        description: `Report "${report.filename}" deleted successfully`,
      });

      // ✅ Remove from reports state to update UI
      setReports((prev) => prev.filter((r) => r.id !== report.id));
    } catch (err) {
      console.error("❌ Error deleting report:", err);
      toast({
        title: "Error deleting report",
        description: err.message || "Something went wrong.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const userData = await getUserData("user_salescout_id");
        const uuid = userData.value;

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}:6005/get-reports`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ uuid: uuid }),
          }
        );

        const result = await response.json();
        if (result.reports) {
          setReports(result.reports);
        }
      } catch (error) {
        console.error("Error fetching reports:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved Reports</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Report Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Generated</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">
                  {report.filename}
                </TableCell>
                <TableCell>Generated Report</TableCell>
                <TableCell>{formatDate(report.saved_at)}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      const encodedUrl = encodeURIComponent(report.file_link);
                      window.open(`/doc-editor?fileurl=${encodedUrl}`, "_blank");
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleDownload(report)
                    }
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(report)}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
