// Algunas librerías (async-storage, reanimated, worklets) piden iOS 13.4 y
// Xcode ya no compila para menos de iOS 15. Al instalar los pods se les
// sube el mínimo al mismo de la app.
const fs = require('fs');
const path = require('path');
const { withDangerousMod } = require('expo/config-plugins');

const MARK = '# withPodsDeploymentTarget';
const SNIPPET = `
    ${MARK}
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |config|
        if config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'].to_f < 15.1
          config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1'
        end
      end
    end`;

module.exports = (config) =>
  withDangerousMod(config, [
    'ios',
    (cfg) => {
      const podfile = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfile, 'utf8');
      if (!contents.includes(MARK)) {
        contents = contents.replace(
          /(post_install do \|installer\|\n\s*react_native_post_install\([\s\S]*?\n\s*\))/,
          `$1\n${SNIPPET}`
        );
        fs.writeFileSync(podfile, contents);
      }
      return cfg;
    },
  ]);
