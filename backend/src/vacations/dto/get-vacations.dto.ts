export class GetVacationsDto {
  page?: number = 1;
  limit?: number = 10;
  sortBy?: string = 'startDate';
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
  status?: string[] = [];
}
