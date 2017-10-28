import {Loop} from 'whs';
import {ArMarkerControls, ArToolkitContext, ArToolkitSource} from 'ar.js';

export default class ARJSModule {
  constructor(params = {}) {
    this.source = new ArToolkitSource({
      sourceType: 'webcam'
    });

    this.params = params;

    const {sourceWidth, sourceHeight} = this.source.parameters;

    this.context = new ArToolkitContext({
      detectionMode: 'mono',
      cameraParametersUrl: params.cameraParametersUrl,
      sourceWidth,
      sourceHeight
    });
  }

  manager(manager) {
    this.element = manager.get('renderer').domElement;
    this.camera = manager.get('camera').native;
    this.scene = manager.get('scene');

    this.source.init(() => {
      console.log('source is ready');
      // handle resize of renderer
      this.source.onResize(this.element);
    });

    this.controls = new ArMarkerControls(this.context, this.camera, {
      type: 'pattern',
      patternUrl: this.params.patternUrl,
      changeMatrixMode: 'cameraTransformMatrix'
    });

    this.context.init(() => {
      this.camera.projectionMatrix.fromArray(
        this.context.arController.getCameraMatrix()
      );
    });
  }

  integrate(self) {
    const {context, source, scene, camera} = self;

    scene.visible = false;

    const updateLoop = new Loop(() => {
      if (source.ready === false) return;
      context.update(source.domElement);
      camera.visible = true;
      scene.visible = camera.visible;
      // console.log(scene.visible);
    });

    this.loops.unshift(updateLoop);
    updateLoop.start();
  }
}
