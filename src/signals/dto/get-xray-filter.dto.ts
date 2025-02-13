/**
 * DTO for filtering Xray signals.
 *
 * Allows filtering by:
 * - deviceId: to get records for a specific device.
 * - minDataLength & maxDataLength: to filter by x-ray data size.
 * - minDataVolume & maxDataVolume: to filter by total data volume.
 * - startTime & endTime: to filter records within a specific time range.
 */
export class GetXrayFilterDto {
  deviceId?: string;
  minDataLength?: number;
  maxDataLength?: number;
  minDataVolume?: number;
  maxDataVolume?: number;
  startTime?: string;
  endTime?: string;
}
