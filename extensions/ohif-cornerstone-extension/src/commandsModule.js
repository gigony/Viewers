import cornerstone from 'cornerstone-core';
import cornerstoneTools from 'cornerstone-tools';
import OHIF from 'ohif-core';
const scroll = cornerstoneTools.import('util/scroll');

const actions = {
  rotateViewport: ({ viewports, rotation }) => {
    const enabledElement = _getActiveViewportEnabledElement(
      viewports.viewportSpecificData,
      viewports.activeViewportIndex
    );

    if (enabledElement) {
      let viewport = cornerstone.getViewport(enabledElement);
      viewport.rotation += rotation;
      cornerstone.setViewport(enabledElement, viewport);
    }
  },
  flipViewportHorizontal: ({ viewports }) => {
    const enabledElement = _getActiveViewportEnabledElement(
      viewports.viewportSpecificData,
      viewports.activeViewportIndex
    );

    if (enabledElement) {
      let viewport = cornerstone.getViewport(enabledElement);
      viewport.hflip = !viewport.hflip;
      cornerstone.setViewport(enabledElement, viewport);
    }
  },
  flipViewportVertical: ({ viewports }) => {
    const enabledElement = _getActiveViewportEnabledElement(
      viewports.viewportSpecificData,
      viewports.activeViewportIndexp
    );

    if (enabledElement) {
      let viewport = cornerstone.getViewport(enabledElement);
      viewport.vflip = !viewport.vflip;
      cornerstone.setViewport(enabledElement, viewport);
    }
  },
  scaleViewport: ({ viewports, direction }) => {
    const enabledElement = _getActiveViewportEnabledElement(
      viewports.viewportSpecificData,
      viewports.activeViewportIndex
    );
    const step = direction * 0.15;

    if (enabledElement) {
      if (step) {
        let viewport = cornerstone.getViewport(enabledElement);
        viewport.scale += step;
        cornerstone.setViewport(enabledElement, viewport);
      } else {
        cornerstone.fitToWindow(enabledElement);
      }
    }
  },
  resetViewport: ({ viewports }) => {
    const enabledElement = _getActiveViewportEnabledElement(
      viewports.viewportSpecificData,
      viewports.activeViewportIndex
    );

    if (enabledElement) {
      cornerstone.reset(enabledElement);
    }
  },
  invertViewport: ({ viewports }) => {
    const enabledElement = _getActiveViewportEnabledElement(
      viewports.viewportSpecificData,
      viewports.activeViewportIndex
    );

    if (enabledElement) {
      let viewport = cornerstone.getViewport(enabledElement);
      viewport.invert = !viewport.invert;
      cornerstone.setViewport(enabledElement, viewport);
    }
  },
  // TODO: this is receiving `evt` from `ToolbarRow`. We could use it to have
  //       better mouseButtonMask sets.
  setToolActive: ({ toolName }) => {
    if (!toolName) {
      console.warn('No toolname provided to setToolActive command');
    }
    cornerstoneTools.setToolActive(toolName, { mouseButtonMask: 1 });
  },
  updateViewportDisplaySet: ({ direction }) => {
    // TODO
    console.warn('updateDisplaySet: ', direction);
  },
  clearAnnotations: ({ viewports }) => {
    const element = _getActiveViewportEnabledElement(
      viewports.viewportSpecificData,
      viewports.activeViewportIndex
    );
    if (!element) {
      return;
    }

    const enabledElement = cornerstone.getEnabledElement(element);
    if (!enabledElement || !enabledElement.image) {
      return;
    }

    const {
      toolState,
    } = cornerstoneTools.globalImageIdSpecificToolStateManager;
    if (
      !toolState ||
      toolState.hasOwnProperty(enabledElement.image.imageId) === false
    ) {
      return;
    }

    const imageIdToolState = toolState[enabledElement.image.imageId];

    const measurementsToRemove = [];

    Object.keys(imageIdToolState).forEach(toolType => {
      const { data } = imageIdToolState[toolType];

      data.forEach(measurementData => {
        const { _id, lesionNamingNumber, measurementNumber } = measurementData;
        if (!_id) {
          return;
        }

        measurementsToRemove.push({
          toolType,
          _id,
          lesionNamingNumber,
          measurementNumber,
        });
      });
    });

    console.log('************************');
    console.log(measurementsToRemove);
    measurementsToRemove.forEach(measurementData => {
      OHIF.measurements.MeasurementHandlers.onRemoved({
        detail: {
          toolType: measurementData.toolType,
          measurementData,
        },
      });
    });
  },
  saveMeasurements: ({ viewports }) => {
    const measurementApi = OHIF.measurements.MeasurementApi.Instance;
    measurementApi.storeMeasurements('TimepointId');

    // const element = _getActiveViewportEnabledElement(
    //   viewports.viewportSpecificData,
    //   viewports.activeViewportIndex
    // );
    // if (!element) {
    //   return;
    // }

    // const enabledElement = cornerstone.getEnabledElement(element);
    // if (!enabledElement || !enabledElement.image) {
    //   return;
    // }
    // console.log("#enabledElement", enabledElement);
    // const {
    //   toolState,
    // } = cornerstoneTools.globalImageIdSpecificToolStateManager;
    // console.log("#enabledElement.image.imageId", enabledElement.image.imageId)
    // console.log("#toolState", toolState);
    // if (
    //   !toolState ||
    //   toolState.hasOwnProperty(enabledElement.image.imageId) === false
    // ) {
    //   console.log("# oh my god", enabledElement.image);
    //   return;
    // }

    // const imageIdToolState = toolState[enabledElement.image.imageId];
    // console.log("#imageId", enabledElement.image.imageId);
    // console.log("#toolState", toolState);

    // // const measurementsToRemove = [];

    // // Object.keys(imageIdToolState).forEach(toolType => {
    // //   const { data } = imageIdToolState[toolType];

    // //   data.forEach(measurementData => {
    // //     const { _id, lesionNamingNumber, measurementNumber } = measurementData;
    // //     if (!_id) {
    // //       return;
    // //     }

    // //     measurementsToRemove.push({
    // //       toolType,
    // //       _id,
    // //       lesionNamingNumber,
    // //       measurementNumber,
    // //     });
    // //   });
    // // });

    // // measurementsToRemove.forEach(measurementData => {
    // //   OHIF.measurements.MeasurementHandlers.onRemoved({
    // //     detail: {
    // //       toolType: measurementData.toolType,
    // //       measurementData,
    // //     },
    // //   });
    // // });
  },
  loadMeasurements: ({ viewports }) => {
    const element = _getActiveViewportEnabledElement(
      viewports.viewportSpecificData,
      viewports.activeViewportIndex
    );

    if (!element) {
      return;
    }

    const enabledElement = cornerstone.getEnabledElement(element);
    if (!enabledElement || !enabledElement.image) {
      return;
    }
    console.log('#enabledElement', enabledElement);

    const measurementApi = OHIF.measurements.MeasurementApi.Instance;
    // const patient
    const currentTimepointId = 'TimepointId';
    // measurementApi.retrieveMeasurements(patientId, [currentTimepointId]);
    console.log('#loadMeasurements', viewports);

    // let state = JSON.parse('{"wadors:https://server.dcmjs.org/dcm4chee-arc/aets/DCM4CHEE/rs/studies/1.3.6.1.4.1.14519.5.2.1.6279.6001.265704884949271879044145982159/series/1.3.6.1.4.1.14519.5.2.1.6279.6001.154677396354641150280013275227/instances/1.3.6.1.4.1.14519.5.2.1.6279.6001.270457347110110870039665832968/frames/1":{"Angle":{"data":[{"visible":true,"active":false,"invalidated":false,"handles":{"start":{"x":152.6746987951807,"y":121.83132530120481,"highlight":true,"active":false},"middle":{"x":428.72289156626505,"y":297.6385542168674,"highlight":true,"active":false},"end":{"x":160.38554216867476,"y":424.09638554216866,"highlight":true,"active":false},"textBox":{"active":false,"hasMoved":false,"movesIndependently":false,"drawnIndependently":true,"allowedOutsideImage":true,"hasBoundingBox":true,"x":452.1375257126066,"y":297.6385542168674,"boundingBox":{"width":56.125,"height":25,"left":898.6506024096386,"top":178.1746987951807}}},"patientId":"LIDC-IDRI-0314","studyInstanceUid":"1.3.6.1.4.1.14519.5.2.1.6279.6001.265704884949271879044145982159","seriesInstanceUid":"1.3.6.1.4.1.14519.5.2.1.6279.6001.154677396354641150280013275227","sopInstanceUid":"1.3.6.1.4.1.14519.5.2.1.6279.6001.270457347110110870039665832968","frameIndex":0,"imagePath":"1.3.6.1.4.1.14519.5.2.1.6279.6001.265704884949271879044145982159_1.3.6.1.4.1.14519.5.2.1.6279.6001.154677396354641150280013275227_1.3.6.1.4.1.14519.5.2.1.6279.6001.270457347110110870039665832968_0","lesionNamingNumber":1,"userId":null,"toolType":"Angle","_id":"335c7423-d2b7-2418-d43b-1aa011e944a2","timepointId":"TimepointId","measurementNumber":1,"rAngle":57.72,"viewport":{"scale":0.6484375,"translation":{"x":0,"y":0},"voi":{"windowWidth":2000,"windowCenter":-450},"invert":false,"pixelReplication":false,"rotation":0,"hflip":false,"vflip":false,"labelmap":false,"displayedArea":{"tlhc":{"x":1,"y":1},"brhc":{"x":512,"y":512},"rowPixelSpacing":0.78125,"columnPixelSpacing":0.78125,"presentationSizeMode":"NONE"}}}]}}}')
    // const element = _getActiveViewportEnabledElement(
    //   viewports.viewportSpecificData,
    //   viewports.activeViewportIndex
    // );
    // if (!element) {
    //   return;
    // }

    // const enabledElement = cornerstone.getEnabledElement(element);
    // if (!enabledElement || !enabledElement.image) {
    //   return;
    // }

    // const {
    //   restoreToolState,
    //   toolState
    // } = cornerstoneTools.globalImageIdSpecificToolStateManager;
    // for (const prop of Object.keys(state)) {
    //   toolState[prop] = state[prop];
    // }
    // // restoreToolState(state);
    // const {
    //   toolState: toolState2
    // } = cornerstoneTools.globalImageIdSpecificToolStateManager;

    // const imageIdToolState = toolState2[enabledElement.image.imageId];

    // Object.keys(imageIdToolState).forEach(toolType => {
    //   const { data } = imageIdToolState[toolType];

    //   data.forEach(measurementData => {
    //     const { setMeasurements } = OHIF.redux.actions

    //     const action = setMeasurements(layout, viewportSpecificData);

    //     window.store.dispatch(action);

    //     // OHIF.redux.reducers.timepointManager.
    //     // const { _id, lesionNamingNumber, measurementNumber } = measurementData;
    //     // if (!_id) {
    //     //   return;
    //     // }

    //     // OHIF.measurements.MeasurementHandlers.onAdded({
    //     //   detail: {
    //     //     toolType: measurementData.toolType,
    //     //     measurementData,
    //     //   },
    //     // });
    //   });
    // });

    // // Force onImageRendered to fire
    // cornerstone.updateImage(element);
  },
  nextImage: ({ viewports }) => {
    const enabledElement = _getActiveViewportEnabledElement(
      viewports.viewportSpecificData,
      viewports.activeViewportIndex
    );

    scroll(enabledElement, 1);
  },
  previousImage: ({ viewports }) => {
    const enabledElement = _getActiveViewportEnabledElement(
      viewports.viewportSpecificData,
      viewports.activeViewportIndex
    );

    scroll(enabledElement, -1);
  },
};

const definitions = {
  rotateViewportCW: {
    commandFn: actions.rotateViewport,
    storeContexts: ['viewports'],
    options: { rotation: 90 },
  },
  rotateViewportCCW: {
    commandFn: actions.rotateViewport,
    storeContexts: ['viewports'],
    options: { rotation: -90 },
  },
  invertViewport: {
    commandFn: actions.invertViewport,
    storeContexts: ['viewports'],
    options: {},
  },
  flipViewportVertical: {
    commandFn: actions.flipViewportVertical,
    storeContexts: ['viewports'],
    options: {},
  },
  flipViewportHorizontal: {
    commandFn: actions.flipViewportHorizontal,
    storeContexts: ['viewports'],
    options: {},
  },
  scaleUpViewport: {
    commandFn: actions.scaleViewport,
    storeContexts: ['viewports'],
    options: { direction: 1 },
  },
  scaleDownViewport: {
    commandFn: actions.scaleViewport,
    storeContexts: ['viewports'],
    options: { direction: -1 },
  },
  fitViewportToWindow: {
    commandFn: actions.scaleViewport,
    storeContexts: ['viewports'],
    options: { direction: 0 },
  },
  resetViewport: {
    commandFn: actions.resetViewport,
    storeContexts: ['viewports'],
    options: {},
  },
  clearAnnotations: {
    commandFn: actions.clearAnnotations,
    storeContexts: ['viewports'],
    options: {},
  },
  saveMeasurements: {
    commandFn: actions.saveMeasurements,
    storeContexts: ['viewports'],
    options: {},
  },
  loadMeasurements: {
    commandFn: actions.loadMeasurements,
    storeContexts: ['viewports'],
    options: {},
  },
  nextImage: {
    commandFn: actions.nextImage,
    storeContexts: ['viewports'],
    options: {},
  },
  previousImage: {
    commandFn: actions.previousImage,
    storeContexts: ['viewports'],
    options: {},
  },
  // TODO: First/Last image
  // Next/Previous series/DisplaySet
  nextViewportDisplaySet: {
    commandFn: actions.updateViewportDisplaySet,
    storeContexts: [],
    options: { direction: 1 },
  },
  previousViewportDisplaySet: {
    commandFn: actions.updateViewportDisplaySet,
    storeContexts: [],
    options: { direction: -1 },
  },
  // TOOLS
  setToolActive: {
    commandFn: actions.setToolActive,
    storeContexts: [],
    options: {},
  },
};

/**
 * Grabs `dom` reference for the enabledElement of
 * the active viewport
 */
function _getActiveViewportEnabledElement(viewports, activeIndex) {
  const activeViewport = viewports[activeIndex] || {};
  return activeViewport.dom;
}

export default {
  actions,
  definitions,
  defaultContext: 'ACTIVE_VIEWPORT::CORNERSTONE',
};
