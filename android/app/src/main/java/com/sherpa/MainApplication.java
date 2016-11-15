package com.sherpa_frontend;

import android.app.Application;
import android.util.Log;

import com.facebook.react.ReactApplication;
import com.idehub.GoogleAnalyticsBridge.GoogleAnalyticsBridgePackage;
import com.airbnb.android.react.maps.MapsPackage;
import com.mapbox.reactnativemapboxgl.ReactNativeMapboxGLPackage;
import com.babisoft.ReactNativeLocalization.ReactNativeLocalizationPackage;
import com.i18n.reactnativei18n.ReactNativeI18n;
import com.RNFetchBlob.RNFetchBlobPackage;
import com.learnium.RNDeviceInfo.RNDeviceInfo;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.shell.MainReactPackage;

import java.util.Arrays;
import java.util.List;

public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost = new ReactNativeHost(this) {
    @Override
    protected boolean getUseDeveloperSupport() {
      return BuildConfig.DEBUG;
    }

    @Override
    protected List<ReactPackage> getPackages() {
      return Arrays.<ReactPackage>asList(
          new MainReactPackage(),
            new GoogleAnalyticsBridgePackage(),
            new MapsPackage(),
            new ReactNativeMapboxGLPackage(),
            new ReactNativeLocalizationPackage(),
            new ReactNativeI18n(),
            new RNFetchBlobPackage(),
            new RNDeviceInfo()
      );
    }
  };

  @Override
  public ReactNativeHost getReactNativeHost() {
      return mReactNativeHost;
  }
}
