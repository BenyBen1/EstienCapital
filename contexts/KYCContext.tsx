import React, { createContext, useContext, useState, ReactNode } from 'react';

// Define the structure for KYC data
interface KYCData {
  personalDetails: {
    firstName: string;
    middleName: string;
    lastName: string;
    gender: string;
    email: string;
    phoneNumber: string;
    dateOfBirth: string;
  };
  identification: {
    idDocumentType: string;
    idNumber: string;
    kraPin: string;
    idDocument: { uri: string; name: string; type: string } | null;
    passportPhoto: { uri: string; name: string; type: string } | null;
  };
  professional: {
    occupation: string;
    sourceOfWealth: string;
  };
  address: {
    physicalAddress: string;
    city: string;
    countryOfResidency: string;
    postalAddress: string;
    postalCode: string;
  };
  nextOfKin: {
    firstName: string;
    lastName: string;
    relationship: string;
    phoneNumber: string;
    email: string;
  };
}

// Define the context type
interface KYCContextType {
  kycData: KYCData;
  setKycData: React.Dispatch<React.SetStateAction<KYCData>>;
  resetKycData: () => void;
}

// Initial state for the form data
const initialState: KYCData = {
  personalDetails: {
    firstName: '',
    middleName: '',
    lastName: '',
    gender: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
  },
  identification: {
    idDocumentType: '',
    idNumber: '',
    kraPin: '',
    idDocument: null,
    passportPhoto: null,
  },
  professional: {
    occupation: '',
    sourceOfWealth: '',
  },
  address: {
    physicalAddress: '',
    city: '',
    countryOfResidency: 'Kenya',
    postalAddress: '',
    postalCode: '',
  },
  nextOfKin: {
    firstName: '',
    lastName: '',
    relationship: '',
    phoneNumber: '',
    email: '',
  },
};

const KYCContext = createContext<KYCContextType | undefined>(undefined);

export function KYCProvider({ children }: { children: ReactNode }) {
  const [kycData, setKycData] = useState<KYCData>(initialState);

  const resetKycData = () => {
    setKycData(initialState);
  };

  return (
    <KYCContext.Provider value={{ kycData, setKycData, resetKycData }}>
      {children}
    </KYCContext.Provider>
  );
}

export function useKYC() {
  const context = useContext(KYCContext);
  if (context === undefined) {
    throw new Error('useKYC must be used within a KYCProvider');
  }
  return context;
} 