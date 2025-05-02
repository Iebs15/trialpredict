import { getUserData } from "@/lib/db";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const Editor = () => {
  const [searchParams] = useSearchParams();
  const fileurl = searchParams.get("fileurl");
  const [user, setUser] = useState({ firstName: "", lastName: "", email: "" });

  useEffect(() => {
    const loadEditor = async () => {
      if (!fileurl) {
        console.error("❌ fileurl missing in query params");
        return;
      }

      try {
        const userData = await getUserData("user_salescout_id");
        const firstName = await getUserData("first_name_salescout_user");
        const lastName = await getUserData("last_name_salescout_user");
        const email = await getUserData("user_salescout_email_id");

        const first = firstName?.value || "";
        const last = lastName?.value || "";
        const name = `${first} ${last}`.trim();
        const uuid = userData?.value;

        setUser({
          firstName: first,
          lastName: last,
          email: email?.value || "",
        });
        console.log(fileurl);
        const res = await fetch(`${import.meta.env.VITE_API_URL}:6005/onlyoffice-config`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            file_url: fileurl,
            uuid: uuid,
            name: name,
          }),
        });

        if (!res.ok) {
          throw new Error("Failed to fetch OnlyOffice config");
        }

        const config = await res.json();

        if (!window.DocsAPI || !window.DocsAPI.DocEditor) {
          console.error("❌ DocsAPI is not available.");
          return;
        }

        new window.DocsAPI.DocEditor("onlyoffice-editor", config);
      } catch (error) {
        console.error("❌ Error loading OnlyOffice editor:", error);
      }
    };

    loadEditor();
  }, [fileurl]);

  return <div id="onlyoffice-editor" className="h-full w-full" />;
};

export default Editor;
