import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

type CountryList = Array<{
  name: string;
  code: string;
  flag: string;
} | null>

// Async thunk to fetch country data
export const fetchCountries = createAsyncThunk(
  'countries/fetchCountries',
  async () => {
    // Replace with your actual API endpoint for country data
    const response = await fetch("https://restcountries.com/v3.1/all?fields=idd,name,flags");
    const data = await response.json();
    return data;
  }
);


const initialState = {
  list: [] as CountryList,
  status: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
  error: null,
};

export const countriesSlice = createSlice({
  name: 'countries',
  initialState,
  reducers: {
    // You can add synchronous reducers here if needed
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCountries.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCountries.fulfilled, (state, action) => {
        state.status = 'succeeded';

        console.log("Response", action.payload);

        state.list = action.payload.flatMap((country) => {
          const root = country.idd?.root;
          const suffixes = country.idd?.suffixes || [""];

          return suffixes.map((suffix) => {
            const code = `${root || ""}${suffix}`;
            if (code && country.flags?.svg) {
              return {
                name: country.name.common,
                code: code,
                flag: country.flags.svg,
              };
            }
            return null;
          });
        })
          .filter(Boolean)
          .sort((a, b) => a.name.localeCompare(b.name));;
      })
      .addCase(fetchCountries.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export default countriesSlice.reducer;