import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import clsx from "clsx"; // For conditional class names
import { useVirtualizer } from "@tanstack/react-virtual";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { useNavigate } from "react-router";
import { ChevronDownIcon } from "lucide-react";
import { fetchCountries } from "@/features/countries/countriesSlice";
import { loginSuccess } from "@/features/auth/authSlice";
import { useAppDispatch, useAppSelector } from "@/app/hooks";
import { toast } from "sonner";

// Zod schema for phone number input
const phoneSchema = z.object({
  countryCode: z.string().min(1, "Please select a country code."),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits.")
    .max(15, "Phone number cannot exceed 15 digits.")
    .regex(/^\d+$/, "Phone number must contain only digits."),
});

// Zod schema for OTP input
const otpSchema = z.object({
  otp: z
    .string()
    .length(6, "OTP must be 6 digits.")
    .regex(/^\d+$/, "OTP must contain only digits."),
});

type Country = {
  name: string;
  code: string;
  flag: string;
};

interface CountrySelectorProps {
  searchTerm: string; // Assuming you have a search term to filter countries
  handleOptionClick: (country: Country) => void;
  filteredCountries: Country[];
}

function CountrySelector({
  handleOptionClick,
  filteredCountries,
}: CountrySelectorProps) {
  const parentRef = React.useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: filteredCountries.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36, // Estimated height of each country item in pixels
    overscan: 5, // Render a few extra items above and below the visible area
  });

  const virtualItems = virtualizer.getVirtualItems();

  return (
    <div
      ref={parentRef}
      className="absolute z-10 mt-1 w-full max-h-60 h-[198px] overflow-auto rounded-md bg-background py-1 text-base shadow-lg ring-1 ring-input ring-opacity-5 focus:outline-none sm:text-sm"
      style={{ contain: "strict" }} // Helps with performance
    >
      {filteredCountries.length > 0 ? (
        <div
          style={{
            height: virtualizer.getTotalSize(),
            width: "100%",
            position: "relative",
          }}
        >
          {virtualItems.map((virtualRow) => {
            const country = filteredCountries[virtualRow.index];
            return (
              <div
                key={country.code + country.name}
                data-index={virtualRow.index}
                ref={virtualizer.measureElement} // Essential for dynamic item heights
                className="flex items-center p-2 rounded-md text-sm cursor-pointer hover:bg-background"
                onClick={() => handleOptionClick(country)}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  transform: `translateY(${virtualRow.start}px)`, // Position the item
                }}
              >
                {country.flag && (
                  <img
                    src={country.flag}
                    alt={`${country.name} flag`}
                    className="w-6 h-4 mr-2 rounded-xs"
                  />
                )}
                <span className="flex-grow text-primary">{country.name}</span>
                <span className="ml-2 text-muted-foreground">
                  {country.code}
                </span>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="relative cursor-default select-none py-2 px-4 text-muted-foreground">
          No countries found.
        </div>
      )}
    </div>
  );
}

/**
 * Custom Dropdown for Country Code Selection
 * @param {object} props - Component props.
 * @param {Country | null} props.selectedCountry - The currently selected country object.
 * @param {Array<Country>} props.countries - Array of all country objects.
 * @param {function(Country): void} props.onSelectCountry - Callback when a country is selected.
 * @param {string} props.searchTerm - The current search query.
 * @param {function(string): void} props.onSearchChange - Callback to update the search query.
 * @param {string | undefined} props.errorMessage - Error message from form validation.
 */
function CountryCodeDropdown({
  selectedCountry,
  countries,
  onSelectCountry,
  searchTerm,
  onSearchChange,
  errorMessage,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null); // Ref for the entire dropdown wrapper

  // Filter countries based on the search term
  const filteredCountries =
    searchTerm === ""
      ? countries
      : countries.filter((country) => {
          return (
            country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            country.code.includes(searchTerm)
          );
        });

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOptionClick = (country) => {
    onSelectCountry(country);
    setIsOpen(false);
    onSearchChange(""); // Clear search term on selection
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label
        htmlFor="countryCodeInput"
        className="block text-sm font-medium text-secondary-foreground mb-1"
      >
        Country Code
      </label>
      <div className="flex items-center justify-between w-full border border-input rounded-md shadow-sm py-2 px-3 pr-2 cursor-pointer focus-within:ring-indigo-500 focus-within:border-indigo-500 sm:text-sm bg-background">
        <div className="flex items-center flex-grow">
          {selectedCountry && selectedCountry.flag && (
            <img
              src={selectedCountry.flag}
              alt={`${selectedCountry.name} flag`}
              className="w-6 h-4 mr-2 rounded-xs"
            />
          )}
          <input
            type="text"
            id="countryCodeInput"
            className="flex-grow outline-none bg-transparent text-primary placeholder:text-muted-foreground"
            placeholder="Search country or code"
            value={
              isOpen
                ? searchTerm
                : selectedCountry
                ? `${selectedCountry.name} (${selectedCountry.code})`
                : ""
            }
            onChange={(e) => {
              onSearchChange(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
          />
        </div>
        <ChevronDownIcon
          className={clsx(
            "size-5 text-muted-foreground transform transition-transform duration-200 will-change-transform",
            isOpen ? "rotate-180" : ""
          )}
        />
      </div>

      {errorMessage && (
        <p className="mt-2 text-sm text-red-600">{errorMessage}</p>
      )}

      {isOpen && (
        <CountrySelector
          handleOptionClick={handleOptionClick}
          filteredCountries={filteredCountries}
        />
      )}
    </div>
  );
}

/**
 * PhoneNumberInput Component
 * Handles country code selection and phone number input.
 * @param {object} props - Component props.
 * @param {function} props.onSendOtp - Callback function to send OTP.
 * @param {boolean} props.isSendingOtp - Loading state for OTP sending.
 */
function PhoneNumberInput({ onSendOtp, isSendingOtp }) {
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [searchTerm, setSearchTerm] = useState(""); // State for the custom dropdown search input

  const dispatch = useAppDispatch();

  const countries1 = useAppSelector((state) => state.countries.list);
  const countriesStatus = useAppSelector((state) => state.countries.status);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    resolver: zodResolver(phoneSchema),
    defaultValues: {
      countryCode: "",
      phoneNumber: "",
    },
  });

  // Fetch countries when the component mounts or as needed
  useEffect(() => {
    if (countriesStatus === "idle") {
      dispatch(fetchCountries());
    }
  }, [countriesStatus, dispatch]);

  useEffect(() => {
    if (countries1.length > 0) {
      const defaultCountry =
        countries1.find((c) => c.code === "+91") || countries1[0];
      setSelectedCountry(defaultCountry);
      setValue("countryCode", defaultCountry.code);
    }
  }, [countries1, setValue]);

  // Handle country selection from the custom dropdown
  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setValue("countryCode", country?.code || ""); // Update form value
  };

  return (
    <form onSubmit={handleSubmit(onSendOtp)} className="space-y-6">
      {countriesStatus === "loading" ? (
        <p className="italic text-muted-foreground">Loading countries</p>
      ) : countriesStatus === "failed" ? (
        <p className="italic text-muted-foreground">
          Unable to load countries. Try again later.
        </p>
      ) : (
        <CountryCodeDropdown
          selectedCountry={selectedCountry}
          countries={countries1}
          onSelectCountry={handleCountrySelect}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          errorMessage={errors.countryCode?.message}
        />
      )}

      <div>
        <label
          htmlFor="phoneNumber"
          className="block text-sm font-medium text-secondary-foreground mb-1"
        >
          Phone Number
        </label>
        <input
          type="tel"
          id="phoneNumber"
          {...register("phoneNumber")}
          className="placeholder:text-muted-foreground mt-1 block w-full border border-input rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="e.g., 9876543210"
        />
        {errors.phoneNumber && (
          <p className="mt-2 text-sm text-red-600">
            {errors.phoneNumber.message}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSendingOtp}>
        {isSendingOtp ? (
          <Loader
            variant="circular"
            size="sm"
            className="border-primary-foreground border-t-transparent"
          />
        ) : (
          "Send OTP"
        )}
      </Button>
    </form>
  );
}

/**
 * OtpValidation Component
 * Handles OTP input and validation.
 * @param {object} props - Component props.
 * @param {string} props.enteredPhoneNumber - The phone number to which OTP was sent.
 * @param {function} props.onVerifyOtp - Callback function to verify OTP.
 * @param {boolean} props.isVerifyingOtp - Loading state for OTP verification.
 * @param {string} props.otpError - Error message for OTP validation.
 * @param {function} props.onEditPhoneNumber - Callback to go back to phone input.
 */
function OtpValidation({
  enteredPhoneNumber,
  onVerifyOtp,
  isVerifyingOtp,
  otpError,
  onEditPhoneNumber,
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(otpSchema),
  });

  // Reset form when component mounts or enteredPhoneNumber changes
  useEffect(() => {
    reset();
  }, [enteredPhoneNumber, reset]);

  return (
    <form onSubmit={handleSubmit(onVerifyOtp)} className="space-y-6">
      <p className="text-center text-muted-foreground text-sm mb-8">
        An OTP has been sent to{" "}
        <span className="font-semibold">{enteredPhoneNumber}</span>.
      </p>
      <div>
        <label
          htmlFor="otp"
          className="block text-sm font-medium text-secondary-foreground mb-1"
        >
          Enter OTP
        </label>
        <input
          autoFocus
          type="text"
          id="otp"
          {...register("otp")}
          className="placeholder:text-muted-foreground mt-1 block w-full border border-input rounded-md shadow-sm py-2 px-3 text-center text-xl tracking-widest focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="------"
          maxLength="6"
        />
        {errors.otp && (
          <p className="mt-2 text-sm text-red-600 text-center">
            {errors.otp.message}
          </p>
        )}
        {otpError && (
          <p className="mt-2 text-sm text-red-600 text-center">{otpError}</p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <Button type="submit" className="w-full" disabled={isVerifyingOtp}>
          {isVerifyingOtp ? (
            <Loader
              variant="circular"
              size="sm"
              className="border-primary-foreground border-t-transparent"
            />
          ) : (
            "Verify OTP"
          )}
        </Button>
        <Button
          variant="outline"
          className="w-full"
          onClick={onEditPhoneNumber}
        >
          Edit Phone Number
        </Button>
      </div>
    </form>
  );
}

// Main App component
export function Login() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);

  const [currentStep, setCurrentStep] = useState("phoneInput"); // 'phoneInput', 'otpInput', 'loggedIn'
  const [simulatedOtp, setSimulatedOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [enteredPhoneNumber, setEnteredPhoneNumber] = useState("");

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/chatrooms"); // Redirect if not authenticated
    }
  }, [isAuthenticated, navigate]);

  // Function to simulate sending OTP
  const handleSendOtp = async (data) => {
    setIsSendingOtp(true);
    setOtpError(""); // Clear previous OTP errors
    setEnteredPhoneNumber(`${data.countryCode}${data.phoneNumber}`); // Store for display

    // Simulate API call with a delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Generate a random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedOtp(otp);

    toast(`OTP sent: ${otp}`);

    setIsSendingOtp(false);
    setCurrentStep("otpInput");
  };

  // Function to simulate verifying OTP
  const handleVerifyOtp = async (data) => {
    setIsVerifyingOtp(true);
    setOtpError(""); // Clear previous OTP errors

    // Simulate API call with a delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    if (data.otp === simulatedOtp) {
      navigate("/chatrooms");
      dispatch(
        loginSuccess({
          phoneNumber: enteredPhoneNumber,
          user: { name: "John Doe" }, // add flag
        })
      );

      setSimulatedOtp(""); // Clear simulated OTP after successful verification
    } else {
      setOtpError(`Invalid OTP. Please try again. Use "${simulatedOtp}"`);
    }
    setIsVerifyingOtp(false);
  };

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <h2 className="text-3xl font-bold text-center text-primary mb-4">
          {"Login / Sign Up"}
        </h2>

        {currentStep === "phoneInput" && (
          <PhoneNumberInput
            onSendOtp={handleSendOtp}
            isSendingOtp={isSendingOtp}
          />
        )}

        {currentStep === "otpInput" && (
          <OtpValidation
            enteredPhoneNumber={enteredPhoneNumber}
            onVerifyOtp={handleVerifyOtp}
            isVerifyingOtp={isVerifyingOtp}
            otpError={otpError}
            onEditPhoneNumber={() => setCurrentStep("phoneInput")}
          />
        )}
      </div>
    </div>
  );
}
