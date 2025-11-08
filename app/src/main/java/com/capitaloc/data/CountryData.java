package com.capitaloc.data;

import android.content.Context;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;
import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;

public class CountryData {

    private List<Country> countries;

    public CountryData(Context context) {
        countries = new ArrayList<>();
        loadCountryData(context);
    }

    private void loadCountryData(Context context) {
        String json = null;
        try {
            InputStream is = context.getResources().openRawResource(R.raw.country_data);
            int size = is.available();
            byte[] buffer = new byte[size];
            is.read(buffer);
            is.close();
            json = new String(buffer, "UTF-8");
        } catch (Exception e) {
            e.printStackTrace();
        }

        if (json != null) {
            try {
                JSONArray jsonArray = new JSONArray(json);
                for (int i = 0; i < jsonArray.length(); i++) {
                    JSONObject jsonObject = jsonArray.getJSONObject(i);
                    String name = jsonObject.getString("name");
                    String outline = jsonObject.getString("outline");
                    countries.add(new Country(name, outline));
                }
            } catch (JSONException e) {
                e.printStackTrace();
            }
        }
    }

    public List<Country> getCountries() {
        return countries;
    }
}