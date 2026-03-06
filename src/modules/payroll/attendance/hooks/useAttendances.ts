// attendance/hooks/useAttendances.ts
import { useState, useEffect } from "react";
import { useLazyQuery } from "@apollo/client";
import { GET_ATTENDANCES } from "../graphql/queries";

interface UseAttendancesOptions {
  take?: number;
  filters?: any;
  sorts?: any;
}

export const useAttendances = (options: UseAttendancesOptions = {}) => {
  const { take = 50, filters = {}, sorts = [] } = options;
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [totalCount, setTotalCount] = useState(0);

  const [getAttendances] = useLazyQuery(GET_ATTENDANCES, {
    onCompleted: (data) => {
      setAttendances(data?.attendances?.data || []);
      setTotalCount(data?.attendances?.totalCount || 0);
      setLoading(false);
    },
    onError: (err) => {
      setError(err);
      setLoading(false);
    },
  });

  useEffect(() => {
    refreshAttendances();
  }, [filters, sorts]);

  const refreshAttendances = () => {
    setLoading(true);
    getAttendances({
      variables: {
        options: {
          take,
          filters,
          sorts: sorts.length
            ? sorts
            : [{ property: "attendanceDate", direction: "DESC" }],
        },
      },
    });
  };

  const getAttendanceById = (id: number) => {
    return attendances.find((attendance: any) => attendance.id === id);
  };

  const getWorkerAttendances = (workerId: number) => {
    return attendances.filter(
      (attendance: any) => attendance.worker?.id === workerId,
    );
  };

  const getAttendancesByDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    return attendances.filter((attendance: any) => {
      const attendanceDate = new Date(attendance.attendanceDate)
        .toISOString()
        .split("T")[0];
      return attendanceDate === dateString;
    });
  };

  return {
    attendances,
    loading,
    error,
    totalCount,
    refreshAttendances,
    getAttendanceById,
    getWorkerAttendances,
    getAttendancesByDate,
  };
};
