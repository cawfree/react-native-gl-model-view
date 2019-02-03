import React from 'react';
import {ActivityIndicator, View, StyleSheet, TouchableOpacity, Text} from 'react-native';
import ModelView from 'react-native-gl-model-view';
import {Buffer} from 'buffer';
import axios from 'axios';

import {Alert} from 'react-native';

class RuntimeAssets extends React.Component {
  constructor(nextProps) {
    super(nextProps);
    this.state = ({
      model: null,
      texture: null,
      error: null,
      loading: false,
    });
    this.fetchDemonFromNetwork = this.fetchDemonFromNetwork.bind(this);
  }
  getContentFromUrl(url) {
    return axios({
      method: 'get',
      url,
      responseType: 'blob',
    })
    .then((res) => new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.onloadend = () => resolve(new Buffer(fileReader.result, 'base64'));
      fileReader.onerror = reject;
      fileReader.readAsDataURL(res.data); 
    }));
  }
  fetchDemonFromNetwork() {
    this.setState({
      loading: true,
      error: null,
    });
    return Promise.all([
      this.getContentFromUrl(
        'https://github.com/rastapasta/react-native-gl-model-view/raw/master/example/data/demon.model',
      ),
      this.getContentFromUrl(
        'https://github.com/rastapasta/react-native-gl-model-view/raw/master/example/data/demon.png',
      ),
    ])
      .then((binaries) => {
        const model = binaries[0];
        const texture = binaries[1];
        this.setState({
          model,
          texture,
          loading: false,
          error: null,
        });
      })
      //.then(() => new Promise((resolve, reject) => setTimeout(() => reject(), 5000)))
      .catch(e => this.setState({
        loading: false,
        error: e || new Error('Something unexpected has happened.'),
      }));
  }
  renderModel(nextProps, nextState) {
    const {
      model,
      texture,
    } = nextState;
    return (
      <ModelView
        style={{flex: 1}}
        model="demon.model"
        texture="demon.png"
        scale={0.01}
        translateZ={-2.5}
        rotateX={270}
        rotateY={0}
        rotateZ={0}
      />
    );
  }
  renderControls(nextProps, nextState) {
    const {
      error,
      loading,
    } = nextState;
    return (
      <View
        style={styles.controls}
      >
        {(!!loading) && (
          <ActivityIndicator
          />
        )}
        {(!loading) && (
          <TouchableOpacity
            style={styles.controlBox}
            disabled={loading}
            onPress={this.fetchDemonFromNetwork}
          >
            <Text
              style={error? styles.controlTextError : styles.controlText}
            >
              {error ? 'Retry' : 'Load'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
  render() {
    const {
      model,
      texture,
    } = this.state;
    return (
      <View
        style={styles.container}
      >
      {(model && texture) ? this.renderModel(this.props, this.state) : this.renderControls(this.props, this.state)}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  controls: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlBox: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 5,
  },
  controlTextError: {
    color: 'red',
    fontSize: 30,
  },
  controlText: {
    color: 'black',
    fontSize: 30,
  },
});

export default RuntimeAssets;
