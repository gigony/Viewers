import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import { MODULE_TYPES } from 'ohif-core';
import OHIF from 'ohif-core';
import moment from 'moment';
import WhiteLabellingContext from '../WhiteLabellingContext.js';
import ConnectedHeader from './ConnectedHeader.js';
import ConnectedToolbarRow from './ConnectedToolbarRow.js';
import ConnectedLabellingOverlay from './ConnectedLabellingOverlay';
import ConnectedStudyBrowser from './ConnectedStudyBrowser.js';
import ConnectedViewerMain from './ConnectedViewerMain.js';
import SidePanel from './../components/SidePanel.js';
import { extensionManager } from './../App.js';
import UserManagerContext from '../UserManagerContext';
import './Viewer.css';
/**
 * Inits OHIF Hanging Protocol's onReady.
 * It waits for OHIF Hanging Protocol to be ready to instantiate the ProtocolEngine
 * Hanging Protocol will use OHIF LayoutManager to render viewports properly
 */
/*const initHangingProtocol = () => {
    // When Hanging Protocol is ready
    HP.ProtocolStore.onReady(() => {

        // Gets all StudyMetadata objects: necessary for Hanging Protocol to access study metadata
        const studyMetadataList = OHIF.viewer.StudyMetadataList.all();

        // Instantiate StudyMetadataSource: necessary for Hanging Protocol to get study metadata
        const studyMetadataSource = new OHIF.studies.classes.OHIFStudyMetadataSource();

        // Get prior studies map
        const studyPriorsMap = OHIF.studylist.functions.getStudyPriorsMap(studyMetadataList);

        // Creates Protocol Engine object with required arguments
        const ProtocolEngine = new HP.ProtocolEngine(layoutManager, studyMetadataList, studyPriorsMap, studyMetadataSource);

        // Sets up Hanging Protocol engine
        HP.setEngine(ProtocolEngine);
    });
};*/

/*const viewportUtils = OHIF.viewerbase.viewportUtils;

OHIF.viewer.functionList = {
    toggleCineDialog: viewportUtils.toggleCineDialog,
    toggleCinePlay: viewportUtils.toggleCinePlay,
    clearTools: viewportUtils.clearTools,
    resetViewport: viewportUtils.resetViewport,
    invert: viewportUtils.invert
};*/

class Viewer extends Component {
  static propTypes = {
    studies: PropTypes.array,
    studyInstanceUids: PropTypes.array,
    onTimepointsUpdated: PropTypes.func,
    onMeasurementsUpdated: PropTypes.func,
    // window.store.getState().viewports.viewportSpecificData
    viewports: PropTypes.object.isRequired,
    // window.store.getState().viewports.activeViewportIndex
    activeViewportIndex: PropTypes.number.isRequired,
  };

  constructor(props) {
    super(props);
    OHIF.measurements.MeasurementApi.setConfiguration({
      dataExchange: {
        retrieve: this.retrieveMeasurements,
        store: this.storeMeasurements,
      },
    });

    OHIF.measurements.TimepointApi.setConfiguration({
      dataExchange: {
        retrieve: this.retrieveTimepoints,
        store: this.storeTimepoints,
        remove: this.removeTimepoint,
        update: this.updateTimepoint,
        disassociate: this.disassociateStudy,
      },
    });
  }

  state = {
    isLeftSidePanelOpen: true,
    isRightSidePanelOpen: false,
    selectedRightSidePanel: '',
    selectedLeftSidePanel: 'studies', // TODO: Don't hardcode this
    thumbnails: [],
  };

  retrieveMeasurements = (patientId, timepointIds) => {
    OHIF.log.info('retrieveMeasurements');
    const measurementData = JSON.parse('{"allTools":[{"visible":true,"active":true,"invalidated":false,"handles":{"start":{"x":138.5411764705883,"y":45.17647058823533,"highlight":true,"active":false},"middle":{"x":358.4000000000001,"y":202.79215686274512,"highlight":true,"active":false},"end":{"x":393.53725490196086,"y":233.91372549019601,"highlight":true,"active":false},"textBox":{"active":false,"hasMoved":false,"movesIndependently":false,"drawnIndependently":true,"allowedOutsideImage":true,"hasBoundingBox":true,"x":373.45882352941203,"y":202.79215686274517,"boundingBox":{"width":56.125,"height":25,"left":890.0000000000002,"top":189.50000000000009}}},"patientId":"LIDC-IDRI-0314","studyInstanceUid":"1.3.6.1.4.1.14519.5.2.1.6279.6001.265704884949271879044145982159","seriesInstanceUid":"1.3.6.1.4.1.14519.5.2.1.6279.6001.154677396354641150280013275227","sopInstanceUid":"1.3.6.1.4.1.14519.5.2.1.6279.6001.270457347110110870039665832968","frameIndex":0,"imagePath":"1.3.6.1.4.1.14519.5.2.1.6279.6001.265704884949271879044145982159_1.3.6.1.4.1.14519.5.2.1.6279.6001.154677396354641150280013275227_1.3.6.1.4.1.14519.5.2.1.6279.6001.270457347110110870039665832968_0","lesionNamingNumber":1,"userId":null,"toolType":"Angle","_id":"2af1cf38-78af-9156-9496-ed87a87d0aa4","timepointId":"TimepointId","measurementNumber":1,"rAngle":174.1,"viewport":{"scale":0.99609375,"translation":{"x":0,"y":0},"voi":{"windowWidth":2050.185546875,"windowCenter":-65.244140625},"invert":false,"pixelReplication":false,"rotation":0,"hflip":false,"vflip":false,"labelmap":false,"displayedArea":{"tlhc":{"x":1,"y":1},"brhc":{"x":512,"y":512},"rowPixelSpacing":0.78125,"columnPixelSpacing":0.78125,"presentationSizeMode":"NONE"}}},{"visible":true,"active":true,"invalidated":false,"handles":{"start":{"x":118.46274509803925,"y":354.38431372549024,"highlight":true,"active":false},"middle":{"x":179.70196078431377,"y":229.8980392156863,"highlight":true,"active":false},"end":{"x":114.44705882352946,"y":210.82352941176475,"highlight":true,"active":false},"textBox":{"active":false,"hasMoved":true,"movesIndependently":false,"drawnIndependently":true,"allowedOutsideImage":true,"hasBoundingBox":true,"x":235.92156862745105,"y":219.8588235294118,"boundingBox":{"width":47.140625,"height":25,"left":753,"top":206.50000000000006}}},"patientId":"LIDC-IDRI-0314","studyInstanceUid":"1.3.6.1.4.1.14519.5.2.1.6279.6001.265704884949271879044145982159","seriesInstanceUid":"1.3.6.1.4.1.14519.5.2.1.6279.6001.154677396354641150280013275227","sopInstanceUid":"1.3.6.1.4.1.14519.5.2.1.6279.6001.270457347110110870039665832968","frameIndex":0,"imagePath":"1.3.6.1.4.1.14519.5.2.1.6279.6001.265704884949271879044145982159_1.3.6.1.4.1.14519.5.2.1.6279.6001.154677396354641150280013275227_1.3.6.1.4.1.14519.5.2.1.6279.6001.270457347110110870039665832968_0","lesionNamingNumber":2,"userId":null,"toolType":"Angle","_id":"6c5ac87b-420d-b189-783a-af3a043fad37","timepointId":"TimepointId","measurementNumber":2,"rAngle":80.1,"viewport":{"scale":0.99609375,"translation":{"x":0,"y":0},"voi":{"windowWidth":2050.185546875,"windowCenter":-65.244140625},"invert":false,"pixelReplication":false,"rotation":0,"hflip":false,"vflip":false,"labelmap":false,"displayedArea":{"tlhc":{"x":1,"y":1},"brhc":{"x":512,"y":512},"rowPixelSpacing":0.78125,"columnPixelSpacing":0.78125,"presentationSizeMode":"NONE"}}},{"visible":true,"active":true,"invalidated":false,"handles":{"start":{"x":192.7529411764707,"y":151.59215686274513,"highlight":true,"active":false},"middle":{"x":279.0901960784314,"y":199.78039215686277,"highlight":true,"active":false},"end":{"x":157.6156862745098,"y":318.243137254902,"highlight":true,"active":false},"textBox":{"active":false,"hasMoved":false,"movesIndependently":false,"drawnIndependently":true,"allowedOutsideImage":true,"hasBoundingBox":true,"x":294.14901960784323,"y":199.7803921568628,"boundingBox":{"width":56.125,"height":25,"left":811.0000000000001,"top":186.50000000000006}}},"patientId":"LIDC-IDRI-0314","studyInstanceUid":"1.3.6.1.4.1.14519.5.2.1.6279.6001.265704884949271879044145982159","seriesInstanceUid":"1.3.6.1.4.1.14519.5.2.1.6279.6001.154677396354641150280013275227","sopInstanceUid":"1.3.6.1.4.1.14519.5.2.1.6279.6001.330197819448573447229121048063","frameIndex":0,"imagePath":"1.3.6.1.4.1.14519.5.2.1.6279.6001.265704884949271879044145982159_1.3.6.1.4.1.14519.5.2.1.6279.6001.154677396354641150280013275227_1.3.6.1.4.1.14519.5.2.1.6279.6001.330197819448573447229121048063_0","lesionNamingNumber":3,"userId":null,"toolType":"Angle","_id":"3d2b8c81-4395-e0f1-c85a-d8c4206dfe4b","timepointId":"TimepointId","measurementNumber":3,"rAngle":73.45,"viewport":{"scale":0.99609375,"translation":{"x":0,"y":0},"voi":{"windowWidth":2000,"windowCenter":-450},"invert":false,"pixelReplication":false,"rotation":0,"hflip":false,"vflip":false,"labelmap":false,"displayedArea":{"tlhc":{"x":1,"y":1},"brhc":{"x":512,"y":512},"rowPixelSpacing":0.78125,"columnPixelSpacing":0.78125,"presentationSizeMode":"NONE"}}},{"visible":true,"active":true,"invalidated":false,"handles":{"start":{"x":64.25098039215686,"y":381.49019607843144,"highlight":true,"active":false},"middle":{"x":331.2941176470589,"y":377.47450980392165,"highlight":true,"active":false},"end":{"x":400.564705882353,"y":333.3019607843138,"highlight":true,"active":false},"textBox":{"active":false,"hasMoved":false,"movesIndependently":false,"drawnIndependently":true,"allowedOutsideImage":true,"hasBoundingBox":true,"x":346.3529411764707,"y":377.4745098039217,"boundingBox":{"width":65.109375,"height":25,"left":863.0000000000001,"top":363.5000000000001}}},"patientId":"LIDC-IDRI-0314","studyInstanceUid":"1.3.6.1.4.1.14519.5.2.1.6279.6001.265704884949271879044145982159","seriesInstanceUid":"1.3.6.1.4.1.14519.5.2.1.6279.6001.154677396354641150280013275227","sopInstanceUid":"1.3.6.1.4.1.14519.5.2.1.6279.6001.330197819448573447229121048063","frameIndex":0,"imagePath":"1.3.6.1.4.1.14519.5.2.1.6279.6001.265704884949271879044145982159_1.3.6.1.4.1.14519.5.2.1.6279.6001.154677396354641150280013275227_1.3.6.1.4.1.14519.5.2.1.6279.6001.330197819448573447229121048063_0","lesionNamingNumber":4,"userId":null,"toolType":"Angle","_id":"565de312-4d32-6d66-7e83-1317f529cdb9","timepointId":"TimepointId","measurementNumber":4,"rAngle":148.34,"viewport":{"scale":0.99609375,"translation":{"x":0,"y":0},"voi":{"windowWidth":2000,"windowCenter":-450},"invert":false,"pixelReplication":false,"rotation":0,"hflip":false,"vflip":false,"labelmap":false,"displayedArea":{"tlhc":{"x":1,"y":1},"brhc":{"x":512,"y":512},"rowPixelSpacing":0.78125,"columnPixelSpacing":0.78125,"presentationSizeMode":"NONE"}}},{"visible":true,"active":true,"invalidated":false,"handles":{"start":{"x":394.5411764705883,"y":131.5137254901961,"highlight":true,"active":false},"middle":{"x":192.7529411764707,"y":317.2392156862746,"highlight":true,"active":false},"end":{"x":123.48235294117649,"y":207.81176470588238,"highlight":true,"active":false},"textBox":{"active":false,"hasMoved":false,"movesIndependently":false,"drawnIndependently":true,"allowedOutsideImage":true,"hasBoundingBox":true,"x":111.3098039215688,"y":317.23921568627463,"boundingBox":{"width":56.125,"height":25,"left":628.8750000000002,"top":303.5000000000001}}},"patientId":"LIDC-IDRI-0314","studyInstanceUid":"1.3.6.1.4.1.14519.5.2.1.6279.6001.265704884949271879044145982159","seriesInstanceUid":"1.3.6.1.4.1.14519.5.2.1.6279.6001.154677396354641150280013275227","sopInstanceUid":"1.3.6.1.4.1.14519.5.2.1.6279.6001.330197819448573447229121048063","frameIndex":0,"imagePath":"1.3.6.1.4.1.14519.5.2.1.6279.6001.265704884949271879044145982159_1.3.6.1.4.1.14519.5.2.1.6279.6001.154677396354641150280013275227_1.3.6.1.4.1.14519.5.2.1.6279.6001.330197819448573447229121048063_0","lesionNamingNumber":5,"userId":null,"toolType":"Angle","_id":"74a19571-7d0c-58da-f0e4-7e0e33965c16","timepointId":"TimepointId","measurementNumber":5,"rAngle":79.71,"viewport":{"scale":0.99609375,"translation":{"x":0,"y":0},"voi":{"windowWidth":2000,"windowCenter":-450},"invert":false,"pixelReplication":false,"rotation":0,"hflip":false,"vflip":false,"labelmap":false,"displayedArea":{"tlhc":{"x":1,"y":1},"brhc":{"x":512,"y":512},"rowPixelSpacing":0.78125,"columnPixelSpacing":0.78125,"presentationSizeMode":"NONE"}}}]}');
    // TODO: Retrieve the measurements from the latest available SR
    return Promise.resolve(measurementData);
  };

  storeMeasurements = (measurementData, timepointIds) => {
    OHIF.log.info('storeMeasurements');
    // TODO: Store the measurements into a new SR sent to the active server.
    console.log("#patientID", measurementData.allTools[0] && measurementData.allTools[0].patientId);
    console.log("#timepointId", measurementData.allTools[0] && measurementData.allTools[0].timepointId);
    console.log("#storeMeasurements", JSON.stringify(measurementData));
    return Promise.resolve();
  };

  retrieveTimepoints = filter => {
    OHIF.log.info('retrieveTimepoints');

    // Get the earliest and latest study date
    let earliestDate = new Date().toISOString();
    let latestDate = new Date().toISOString();
    if (this.props.studies) {
      latestDate = new Date('1000-01-01').toISOString();
      this.props.studies.forEach(study => {
        const studyDate = moment(study.studyDate, 'YYYYMMDD').toISOString();
        if (studyDate < earliestDate) {
          earliestDate = studyDate;
        }
        if (studyDate > latestDate) {
          latestDate = studyDate;
        }
      });
    }

    // Return a generic timepoint
    return Promise.resolve([
      {
        timepointType: 'baseline',
        timepointId: 'TimepointId',
        studyInstanceUids: this.props.studyInstanceUids,
        patientId: filter.patientId,
        earliestDate,
        latestDate,
        isLocked: false,
      },
    ]);
  };

  storeTimepoints = timepointData => {
    OHIF.log.info('storeTimepoints');
    return Promise.resolve();
  };

  updateTimepoint = (timepointData, query) => {
    OHIF.log.info('updateTimepoint');
    return Promise.resolve();
  };

  removeTimepoint = timepointId => {
    OHIF.log.info('removeTimepoint');
    return Promise.resolve();
  };

  disassociateStudy = (timepointIds, studyInstanceUid) => {
    OHIF.log.info('disassociateStudy');
    return Promise.resolve();
  };

  onTimepointsUpdated = timepoints => {
    if (this.props.onTimepointsUpdated) {
      this.props.onTimepointsUpdated(timepoints);
    }
  };

  onMeasurementsUpdated = measurements => {
    if (this.props.onMeasurementsUpdated) {
      console.log("##onMeasurementsUpdated", measurements);
      this.props.onMeasurementsUpdated(measurements);
    }
  };

  componentDidMount() {
    const { studies } = this.props;
    const { TimepointApi, MeasurementApi } = OHIF.measurements;
    const currentTimepointId = 'TimepointId';

    const timepointApi = new TimepointApi(currentTimepointId, {
      onTimepointsUpdated: this.onTimepointsUpdated,
    });

    const measurementApi = new MeasurementApi(timepointApi, {
      onMeasurementsUpdated: this.onMeasurementsUpdated,
    });

    this.currentTimepointId = currentTimepointId;
    this.timepointApi = timepointApi;
    this.measurementApi = measurementApi;

    if (studies) {
      const patientId = studies[0] && studies[0].patientId;

      timepointApi.retrieveTimepoints({ patientId });
      measurementApi.retrieveMeasurements(patientId, [currentTimepointId]);

      this.setState({
        thumbnails: _mapStudiesToThumbnails(studies),
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.studies !== prevProps.studies) {
      const { studies } = this.props;
      const patientId = studies[0] && studies[0].patientId;
      const currentTimepointId = this.currentTimepointId;

      this.timepointApi.retrieveTimepoints({ patientId });
      this.measurementApi.retrieveMeasurements(patientId, [currentTimepointId]);

      this.setState({
        thumbnails: _mapStudiesToThumbnails(studies),
      });
    }
  }

  render() {
    let VisiblePanelLeft, VisiblePanelRight;
    const panelExtensions = extensionManager.modules[MODULE_TYPES.PANEL];

    panelExtensions.forEach(panelExt => {
      panelExt.module.components.forEach(comp => {
        if (comp.id === this.state.selectedRightSidePanel) {
          VisiblePanelRight = comp.component;
        } else if (comp.id === this.state.selectedLeftSidePanel) {
          VisiblePanelLeft = comp.component;
        }
      });
    });

    return (
      <>
        {/* HEADER */}
        <WhiteLabellingContext.Consumer>
          {whiteLabelling => (
            <UserManagerContext.Consumer>
              {userManager => (
                <ConnectedHeader home={false} userManager={userManager}>
                  {whiteLabelling.logoComponent}
                </ConnectedHeader>
              )
              }
            </UserManagerContext.Consumer>
          )}
        </WhiteLabellingContext.Consumer>

        {/* TOOLBAR */}
        <ConnectedToolbarRow
          isLeftSidePanelOpen={this.state.isLeftSidePanelOpen}
          isRightSidePanelOpen={this.state.isRightSidePanelOpen}
          selectedLeftSidePanel={
            this.state.isLeftSidePanelOpen
              ? this.state.selectedLeftSidePanel
              : ''
          }
          selectedRightSidePanel={
            this.state.isRightSidePanelOpen
              ? this.state.selectedRightSidePanel
              : ''
          }
          handleSidePanelChange={(side, selectedPanel) => {
            const sideClicked = side && side[0].toUpperCase() + side.slice(1);
            const openKey = `is${sideClicked}SidePanelOpen`;
            const selectedKey = `selected${sideClicked}SidePanel`;
            const updatedState = Object.assign({}, this.state);

            const isOpen = updatedState[openKey];
            const prevSelectedPanel = updatedState[selectedKey];
            // RoundedButtonGroup returns `null` if selected button is clicked
            const isSameSelectedPanel =
              prevSelectedPanel === selectedPanel || selectedPanel === null;

            updatedState[selectedKey] = selectedPanel || prevSelectedPanel;

            const isClosedOrShouldClose = !isOpen || isSameSelectedPanel;
            if (isClosedOrShouldClose) {
              updatedState[openKey] = !updatedState[openKey];
            }

            this.setState(updatedState);
          }}
        />

        {/*<ConnectedStudyLoadingMonitor studies={this.props.studies} />*/}
        {/*<StudyPrefetcher studies={this.props.studies} />*/}

        {/* VIEWPORTS + SIDEPANELS */}
        <div className="FlexboxLayout">
          {/* LEFT */}
          <SidePanel from="left" isOpen={this.state.isLeftSidePanelOpen}>
            {VisiblePanelLeft ? (
              <VisiblePanelLeft
                viewports={this.props.viewports}
                activeIndex={this.props.activeViewportIndex}
              />
            ) : (
                <ConnectedStudyBrowser studies={this.state.thumbnails} />
              )}
          </SidePanel>

          {/* MAIN */}
          <div className={classNames('main-content')}>
            <ConnectedViewerMain studies={this.props.studies} />
          </div>

          {/* RIGHT */}
          <SidePanel from="right" isOpen={this.state.isRightSidePanelOpen}>
            {VisiblePanelRight && (
              <VisiblePanelRight
                viewports={this.props.viewports}
                activeIndex={this.props.activeViewportIndex}
              />
            )}
          </SidePanel>
        </div>
        <ConnectedLabellingOverlay />
      </>
    );
  }
}

export default Viewer;

/**
 * What types are these? Why do we have "mapping" dropped in here instead of in
 * a mapping layer?
 *
 * TODO[react]:
 * - Add sorting of display sets
 * - Add showStackLoadingProgressBar option
 *
 * @param {Study[]} studies
 * @param {DisplaySet[]} studies[].displaySets
 */
const _mapStudiesToThumbnails = function (studies) {
  return studies.map(study => {
    const { studyInstanceUid } = study;

    const thumbnails = study.displaySets.map(displaySet => {
      const {
        displaySetInstanceUid,
        seriesDescription,
        seriesNumber,
        instanceNumber,
        numImageFrames,
      } = displaySet;

      let imageId;
      let altImageText;

      if (displaySet.modality && displaySet.modality === 'SEG') {
        // TODO: We want to replace this with a thumbnail showing
        // the segmentation map on the image, but this is easier
        // and better than what we have right now.
        altImageText = 'SEG';
      } else if (displaySet.images && displaySet.images.length) {
        const imageIndex = Math.floor(displaySet.images.length / 2);

        imageId = displaySet.images[imageIndex].getImageId();
      } else {
        altImageText = displaySet.modality ? displaySet.modality : 'UN';
      }

      return {
        imageId,
        altImageText,
        displaySetInstanceUid,
        seriesDescription,
        seriesNumber,
        instanceNumber,
        numImageFrames,
      };
    });

    return {
      studyInstanceUid,
      thumbnails,
    };
  });
};
