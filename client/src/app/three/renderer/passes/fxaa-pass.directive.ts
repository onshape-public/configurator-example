import { Directive } from '@angular/core';
import {AbstractPass} from './abstract-pass';
import {WebGLRendererComponent} from '../webgl-renderer.component';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass';
import {FXAAShader} from 'three/examples/jsm/shaders/FXAAShader';

@Directive({
  selector: 'three-fxaa-pass'
})
export class FxaaPassDirective extends AbstractPass<ShaderPass> {

  shaderPass: ShaderPass;

  constructor() {
    super();
  }

  setup(renderer: WebGLRendererComponent): ShaderPass {
    this.shaderPass = new ShaderPass(FXAAShader);
    //this.shaderPass.uniforms[ 'resolution' ].value.set( 1 / renderer.getSize().x, 1 / renderer.getSize().y );
    this.shaderPass.uniforms[ 'resolution' ].value.set( 1 / window.innerWidth, 1 / window.innerHeight );
    return this.shaderPass;
  }

}
