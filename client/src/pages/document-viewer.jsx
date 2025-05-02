import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { ArrowLeft, Download, Save } from "lucide-react";
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from "docx";
import { saveAs } from "file-saver";

export default function DocumentViewer() {
  const location = useLocation();
  const navigate = useNavigate();
  const [content, setContent] = useState('');
  const [originalProfiles, setOriginalProfiles] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (location.state?.documentHtml) {
      setContent(location.state.documentHtml);
    }
    if (location.state?.originalProfiles) {
      setOriginalProfiles(location.state.originalProfiles);
    }
  }, [location.state]);

  const handleSave = () => {
    // Here you would typically save the changes back to a server
    // For now, we'll just show a success message
    alert('Changes saved successfully!');
  };

  const handleDownload = async () => {
    try {
      // Create a new document with proper formatting
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              text: "Prospect Profiles Report",
              heading: HeadingLevel.HEADING_1,
              spacing: {
                after: 200,
              },
              style: {
                size: 32,
                bold: true,
              },
            }),
            new Paragraph({
              children: [
                new TextRun({
                  text: `Generated on ${new Date().toLocaleDateString()}`,
                  size: 24,
                  color: "666666",
                }),
              ],
              spacing: {
                after: 400,
              },
            }),
            ...originalProfiles.flatMap(profile => [
              new Paragraph({
                text: profile["Product Name"],
                heading: HeadingLevel.HEADING_2,
                spacing: {
                  before: 400,
                  after: 200,
                },
                style: {
                  size: 28,
                  bold: true,
                },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Manufacturer: ${profile.Manufacturer}`,
                    size: 24,
                  }),
                ],
                spacing: {
                  after: 200,
                },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Phase: ${profile.Phase}`,
                    size: 24,
                  }),
                ],
                spacing: {
                  after: 200,
                },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Mechanism of Action: ${profile["Mechanism of Action"] || "Not specified"}`,
                    size: 24,
                  }),
                ],
                spacing: {
                  after: 200,
                },
              }),
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Therapeutic Area: ${profile.Indication}`,
                    size: 24,
                  }),
                ],
                spacing: {
                  after: 400,
                },
              }),
            ]),
          ],
        }],
      });

      // Generate and download the document
      const blob = await Packer.toBlob(doc);
      saveAs(blob, "prospect_profiles_report.docx");
    } catch (error) {
      console.error("Error downloading document:", error);
      alert("Error downloading document");
    }
  };

  return (
    <div className="flex-1 space-y-4 p-8">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profiles
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div
          className="prose max-w-none"
          contentEditable={true}
          suppressContentEditableWarning={true}
          dangerouslySetInnerHTML={{ __html: content }}
          style={{ minHeight: '500px' }}
        />
      </Card>
    </div>
  );
}