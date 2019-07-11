

export interface RendererListener {
  onStartRendering();
  onRender(delta: number);
}
