import React, { Component } from 'react';
import { connect } from 'react-redux';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Card, CardSection, Button } from '../common';
import { setSelectedRestaurant, clearActiveList } from '../../actions';

class ActiveList extends Component {

  onListItemPress(item) {
    this.props.setSelectedRestaurant(item)
  }

  clearList() {
    this.props.clearActiveList()
  }

  renderActiveList() {
    if(this.props.activeList.length >= 1) {
      return (
            <View>{this.props.activeList.map(item => (
              <Card key={item.name}>
                <TouchableOpacity onPress={() => this.onListItemPress(item)}>
                  <CardSection>
                    <View style={styles.thumbnailContainerStyle}>
                      <Image
                        source={{ uri: item.thumb }}
                        style={styles.thumbnailStyle}
                      />
                    </View>
                    <View style={styles.headerContentStyle}>
                      <Text style={styles.headerTextStyle}>{item.name}</Text>
                      <Text>Price: {item.price}</Text>
                    </View>
                  </CardSection>
                </TouchableOpacity>
              </Card>
            ))}</View>
      )
    }
    return <Card><CardSection><Text>Add Something To Your List Silly!</Text></CardSection></Card>;
  }

  render(){
    return (
      <View>
      <Card>
        <CardSection>
          <Button onPress={() => this.clearList()}>Clear List</Button>
        </CardSection>
      </Card>
      <View>{this.renderActiveList()}</View>
      </View>

    )
  }
}

const styles = {
  headerContentStyle: {
    flexDirection: 'column',
    justifyContent: 'space-around',
  },
  headerTextStyle: {
    fontSize: 18
  },
  thumbnailStyle: {
    height: 50,
    width: 50,
  },
  thumbnailContainerStyle: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
    marginRight: 10,
  },
  imageStyle: {
    height: 300,
    flex: 1,
    width: null,
  }
};

const mapStateToProps = ({ activeList }) => {
  return { activeList };
}

export default connect(mapStateToProps, { setSelectedRestaurant, clearActiveList })(ActiveList);
