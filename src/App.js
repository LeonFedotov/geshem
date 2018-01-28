import React, { Component } from 'react'
import ReactMapboxGl, { Layer } from 'react-mapbox-gl'
import moment from 'moment-timezone'
import request from 'superagent'
import Slider from 'react-rangeslider'

import 'react-rangeslider/lib/index.css'
import './app.css'
import debug from 'debug'
const log = debug('app:log')
const Map = ReactMapboxGl({
  accessToken: process.env.REACT_APP_MAPBOXGL_ACCESS_TOKEN
})
const rasterCoords = {
  140: [
    [33.35317413, 33.27232471],
    [36.32243686, 33.27232471],
    [36.32243686, 30.72293428],
    [33.35317413, 30.72293428]
  ],
  280: [
    [31.93095218, 34.5156862],
    [37.86644267, 34.5156862],
    [37.86644267, 29.42911589],
    [31.93095218, 29.42911589]
  ]
}
class App extends Component {
  state = {
    images: void 0,
    res: '140',
    slider: 9,
    zoom: [6.3],
    center: [35, 31.9],
  }

  datetime() {
    if(this.state.images) {
      const { images, res, slider } = this.state
      return moment
        .utc(images[res][slider].substr(5, 13), 'YYYYMMDD/HHmm')
        .tz('Asia/Jerusalem')
    } else {
      return ''
    }
  }

  getDate() {
    return this.state.images ? this.datetime().format('YYYY-MM-DD') : ''
  }

  getTime() {
    return this.state.images ? this.datetime().format('HH:mm') : ''
  }
  move = (map) => this.setState({
    ...this.state,
    center: [map.getCenter().lng, map.getCenter().lat]
  })
  zoom = (map) => {
    const {res, slider} = this.state
    const nextRes = map.getZoom() > 7 ? '280' : '140'
    nextRes !== res && map.removeLayer(`radar-${res}-${slider}`)//, 'raster-opacity', 0)
    this.setState({
      ...this.state,
      zoom: [map.getZoom()],
      res: nextRes
    })
  }
  styleLoaded = (map) => {
    request
      .get('/images.json')
      .set('withCredentials', true)
      .type('json')
      .then(({body: images}) => {
        ['140', '280'].map((res) =>
          images[res].map((image, index) =>
            map.addSource(`radar-${res}-${index}`, {
              type: 'image',
              url: `//imgs.geshem.space/${image}`,
              coordinates: rasterCoords[res]
            })
          )
        )
        this.setState({...this.state, images})
      })
  }

  radarLayer() {
    const {res, images = {[res]:[]}, slider} = this.state
    return images[res].map((image, index) => {
      const LayerProps = {
        id: `radar-${res}-${index}`,
        sourceId: `radar-${res}-${index}`,
        type: 'raster',
        paint: {
          'raster-opacity': slider === index ? .85 : 0,
          'raster-opacity-transition': {
            'duration': 0
          }
        }
      }
      return <Layer key={`layer_${index}`} {...LayerProps}/>
    })
  }
  handleOnChange = (slider) => this.setState({...this.state, slider})
  render() {
    const {zoom, center} = this.state
    const mapProps = {
      container: 'map',
      style: 'mapbox://styles/mapbox/dark-v9',
      containerStyle: {
        height: '100vh',
        width: '100vh'
      },
      onStyleLoad: this.styleLoaded,
      onZoom: this.zoom,
      onMoveEnd: this.move,
      maxZoom: 10,
      minZoom: 5,
      zoom,
      center,
      hash: false
    }
    const {slider} = this.state
    return (
      <div>
        <Map {...mapProps}>{this.radarLayer()}</Map>
        <div className="datetime">
          <div className="date">{this.getDate()}</div>
          <div className="time">{this.getTime()}</div>
        </div>
        <Slider
          tooltip={false}
          min={0}
          max={9}
          value={slider}
          onChange={this.handleOnChange}
        />
      </div>
    )

  }
}

export default App
