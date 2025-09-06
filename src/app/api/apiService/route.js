import axios from 'axios';

if (!process.env.NEXT_PUBLIC_API_BASE_URL) {
  throw new Error(
    'NEXT_PUBLIC_API_BASE_URL is not defined in .env.local'
  );
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL.trim();

export const fetchLocations = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/findLocation`);
    const data = response.data?.data || [];
    console.log('[fetchLocations] response:', data);
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error('Error fetching locations:', error);
    return [];
  }
};

export const fetchDoctors = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/findDoctor`);
    const data = response.data?.data || [];
    console.log('[fetchDoctors] response:', data);
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error('Error fetching doctors:', error);
    return [];
  }
};

export const fetchContact = async (payload) => {
  try {
    const filteredPayload = {
      ...payload,
      locationID: Array.isArray(payload.locationID)
        ? payload.locationID.filter((id) => !!id)
        : [],
      mainDoctorID: Array.isArray(payload.mainDoctorID)
        ? payload.mainDoctorID.filter((id) => !!id)
        : [],
    };

    console.log('[fetchContact] payload ที่ใช้:', filteredPayload);

    const response = await axios.post(
      `${BASE_URL}/findPatreg/Contact`,
      filteredPayload
    );
    const data = response.data?.data;

    if (!data || (Array.isArray(data) && data.length === 0)) {
      console.log('[fetchContact] ไม่พบข้อมูลผู้ป่วย');
      return [];
    }

    const result = Array.isArray(data) ? data : [data];
    console.log(`[fetchContact] ได้ข้อมูล ${result.length} รายการ`);
    return result;
  } catch (error) {
    console.error('Error posting to findPatreg/Contact:', error);
    return [];
  }
};
