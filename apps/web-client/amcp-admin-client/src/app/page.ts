import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-page',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="w-full">
      <h2 class="text-3xl font-bold">{{ title }}</h2>
      <p class="mt-3 text-base text-gray-600">{{ description }}</p>
    </section>
  `,
})
export class PageComponent {
  private readonly route = inject(ActivatedRoute);

  get title(): string {
    return (this.route.snapshot.data['title'] as string | undefined) ?? 'Page';
  }

  get description(): string {
    const description = this.route.snapshot.data['description'] as string | undefined;
    return description ?? `This is the ${this.title} page.`;
  }
}
