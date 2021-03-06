/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { Text, View, FlatList, Image, StyleSheet, YellowBox, TouchableHighlight } from 'react-native';
import { electrodeBridge } from "react-native-electrode-bridge";

// Internal weird warning from Electrode
YellowBox.ignoreWarnings([
  'Module ElectrodeBridgeTransceiver requires main queue',
]);

const styles = StyleSheet.create({
  listItem: {
    padding: 10
  },
  listContainer: {
    flex: 1,
    flexDirection: "row"
  },
  listSeparator: {
    height: 1,
    opacity: 0.6,
    backgroundColor: "gray",
  },
  movieInfo: {
    flex: 1,
    justifyContent: "center",
    marginLeft: 10
  },
  movieTitle: {
    fontSize: 17,
    fontWeight: "bold"
  },
  movieSubtitle: {
    fontSize: 12,
    color: "gray"
  }
});

class ListItem extends Component {
  _onPress = () => {
    this.props.onPressItem(this.props.movie.id);
  };

  render() {
    return (
        <TouchableHighlight onPress={this._onPress} underlayColor={"rgba(1,1,1,0.2)"} >
          <View style={styles.listItem}>
            <View style={styles.listContainer}>
              <Image source={this.props.movie.image} style={{width: 50, height: 50}}/>
              <View style={styles.movieInfo}>
                <Text style={styles.movieTitle}>{this.props.movie.title}</Text>
                <Text style={styles.movieSubtitle}>{this.props.movie.releaseDate}</Text>
              </View>
            </View>
          </View>
        </TouchableHighlight>
    )
  }
}

export default class App extends Component {
  constructor() {
    super();

    // Initializing vars
    this.getMoviesRequestUUID = null;
    this.state = {
      movies: []
    };
  }

  componentDidMount() {
    this.requestMovies(0, 3);
  }

  componentWillUnmount() {
    electrodeBridge.removeEventListener(this.getMoviesRequestUUID);
  }

  requestMovies(offset, limit) {
    let requestParams = {
      data: {
        offset: offset,
        limit: limit
      },
      timeout: 60000 // 1 minute
    };

    this.getMoviesRequestUUID = electrodeBridge
        .sendRequest("MovieListMiniApp:getMovies", requestParams)
        .then(data => {
          this.didGetMovies(data);
        });
  }

  didGetMovies(data) {
    let movies = data.map(elem => {
      return {
        id: elem.id,
        title: elem.title,
        releaseDate: elem.releaseDate,
        genres: elem.genres,
        image: {
          uri: elem.imageURL
        }
      }
    });

    this.setState(previousState => {
      let newState = previousState;
      newState.movies = movies;
      return newState
    });
  }

  didSelectMovie = id => {
    let data = {
      data: {movieID: id}
    };
    electrodeBridge.emitEvent("MovieListMiniApp:didSelectMovie", data);
  };

  _itemSeparator = () => {
    return (
        <View style={styles.listSeparator} />
    );
  };

  _keyExtractor = (item, _) => item.id.toString();

  render() {
    return (
        <View style={{flex: 1}}>
          <FlatList
              data={this.state.movies}
              keyExtractor={this._keyExtractor}
              renderItem={({item}) => <ListItem movie={item} onPressItem={this.didSelectMovie} />}
              ItemSeparatorComponent={this._itemSeparator}
          />
        </View>
    );
  }
}
