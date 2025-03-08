import { Country, State, City } from "country-state-city";
import React from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface CountryStateCityProps {
  form: any;
  isediting?: boolean;
}

const CountryStateCity: React.FC<CountryStateCityProps> = ({ form, isediting = false }) => {
  const { control, watch, setValue } = form;

  const selectedCountry = watch("country");
  const selectedState = watch("state");

  const countries = Country.getAllCountries();
  const states = selectedCountry
    ? State.getStatesOfCountry(
        countries.find((c) => c.name === selectedCountry)?.isoCode || ""
      )
    : [];
  const cities = selectedState
    ? City.getCitiesOfState(
        countries.find((c) => c.name === selectedCountry)?.isoCode || "",
        states.find((s) => s.name === selectedState)?.isoCode || ""
      )
    : [];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
      {/* Country Selection */}
      <FormField
        control={control}
        name="country"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Country</FormLabel>
            <FormControl>
              <Select
                value={field.value}
                disabled={!isediting}
                onValueChange={(value) => {
                  field.onChange(value);
                  setValue("country", value);
                  setValue("state", ""); 
                  setValue("city", "");
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.isoCode} value={country.name}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* State Selection */}
      <FormField
        control={control}
        name="state"
        render={({ field }) => (
          <FormItem>
            <FormLabel>State</FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={(value) => {
                  field.onChange(value);
                  setValue("state", value);
                  setValue("city", ""); // Reset city when state changes
                }}
                disabled={!selectedCountry || !isediting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select State" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state.isoCode} value={state.name}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* City Selection */}
      <FormField
        control={control}
        name="city"
        render={({ field }) => (
          <FormItem>
            <FormLabel>City</FormLabel>
            <FormControl>
              <Select
                value={field.value}
                onValueChange={field.onChange}
                disabled={!selectedState || !isediting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.name} value={city.name}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default CountryStateCity;
