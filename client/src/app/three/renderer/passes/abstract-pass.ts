import { Pass } from 'three/examples/jsm/postprocessing/Pass';
import {WebGLRendererComponent} from '../webgl-renderer.component';

export abstract class AbstractPass<T extends Pass> {

    public abstract setup(renderer: WebGLRendererComponent): T;
}
