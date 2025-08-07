import { Component, input, output, signal } from '@angular/core';

@Component({
  selector: 'app-image-upload',
  imports: [],
  templateUrl: './image-upload.html',
  styleUrl: './image-upload.css'
})
export class ImageUpload {
  protected imageSrc = signal<string | ArrayBuffer | null | undefined>(null);
  protected isDragging = signal<boolean>(false);
  private filetToUpload: File | null = null;
  uploadFile = output<File>();
  loading = input<boolean>(false);

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.isDragging.set(false);
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();

    this.isDragging.set(false);

    if (event.dataTransfer?.files.length) {
      const file = event.dataTransfer.files[0];
      this.previewImage(file);
      this.filetToUpload = file;
    }
  }

  onCancel() {
    this.imageSrc.set(null);
    this.filetToUpload = null;
  }

  onUpload() {
    if (this.filetToUpload) {
      this.uploadFile.emit(this.filetToUpload);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.filetToUpload = input.files[0];
      this.previewImage(this.filetToUpload);
    }
  }

  private previewImage(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.imageSrc.set(e.target?.result);
    }
    reader.readAsDataURL(file);
  }
}
