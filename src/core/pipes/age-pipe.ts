import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'age'
})
export class AgePipe implements PipeTransform {

  transform(value: Date | string, ...args: unknown[]): number {
    const today = new Date();
    const birthDate = new Date(value);
    
    // Calculate the difference in milliseconds
    const timeDiff = today.getTime() - birthDate.getTime();
    
    // Convert to years (accounting for leap years)
    const ageInYears = timeDiff / (1000 * 60 * 60 * 24 * 365.25);
    
    return Math.floor(ageInYears);
  }
}
