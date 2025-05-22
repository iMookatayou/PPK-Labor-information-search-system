import axios from 'axios';

const BASE_URL = 'http://172.16.78.22/ppk11/his';

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

    const response = await axios.post(`${BASE_URL}/findPatreg/Contact`, filteredPayload);
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
