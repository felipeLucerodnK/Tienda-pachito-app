import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'cop', standalone: true })
export class CopPipe implements PipeTransform {
  transform(value: number): string {
    if (value == null) return '$ 0';
    return '$ ' + value.toLocaleString('es-CO');
  }
}
