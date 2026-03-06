"use client";

import { createContext, useContext, useState, useCallback } from "react";

type UploadData = {
  fileName: string;
  fileSize: number;
  docType: string;
  projectName: string;
  regulatoryFramework: string;
  leadAgency: string;
};

type ReviewContextType = {
  uploadData: UploadData | null;
  setUploadData: (data: UploadData) => void;
};

const ReviewContext = createContext<ReviewContextType>({
  uploadData: null,
  setUploadData: () => {},
});

export function useReviewContext() {
  return useContext(ReviewContext);
}

export function ReviewProvider({ children }: { children: React.ReactNode }) {
  const [uploadData, setUploadDataState] = useState<UploadData | null>(null);

  const setUploadData = useCallback((data: UploadData) => {
    setUploadDataState(data);
  }, []);

  return (
    <ReviewContext.Provider value={{ uploadData, setUploadData }}>
      {children}
    </ReviewContext.Provider>
  );
}
