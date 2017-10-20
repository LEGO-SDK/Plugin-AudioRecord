var fs = require('fs');
var path = require('path');
var plugin = require('../plugin.json');

try {
    // iOS
    (function () {
        var headerContent = fs.readFileSync(path.resolve(__dirname, '../ios/Source/LGOFOOPlugin.h'), 'utf-8');
        headerContent = headerContent.replace(/FOO/ig, plugin.name);
        fs.writeFileSync(path.resolve(__dirname, '../ios/Source/LGO' + plugin.name + 'Plugin.h'), headerContent)
        var implementContent = fs.readFileSync(path.resolve(__dirname, '../ios/Source/LGOFOOPlugin.m'), 'utf-8');
        var requestProps = [];
        var requestAssigns = [];
        for (var key in plugin.request) {
            if (plugin.request[key] === "string") {
                requestProps.push('@property (nonatomic, strong) NSString *' + key + ';')
                requestAssigns.push('operation.request.' + key + ' = [dictionary[@"' + key + '"] isKindOfClass:[NSString class]] ? dictionary[@"' + key + '"] : nil;');
            }
            else if (plugin.request[key] === "int") {
                requestProps.push('@property (nonatomic, assign) NSInteger ' + key + ';')
                requestAssigns.push('operation.request.' + key + ' = [dictionary[@"' + key + '"] isKindOfClass:[NSNumber class]] ? [dictionary[@"' + key + '"] integerValue] : 0;');
            }
            else if (plugin.request[key] === "float") {
                requestProps.push('@property (nonatomic, assign) float ' + key + ';')
                requestAssigns.push('operation.request.' + key + ' = [dictionary[@"' + key + '"] isKindOfClass:[NSNumber class]] ? [dictionary[@"' + key + '"] floatValue] : 0;');
            }
            else if (plugin.request[key] === "boolean") {
                requestProps.push('@property (nonatomic, assign) BOOL ' + key + ';')
                requestAssigns.push('operation.request.' + key + ' = [dictionary[@"' + key + '"] isKindOfClass:[NSNumber class]] ? [dictionary[@"' + key + '"] boolValue] : NO;');
            }
        }
        implementContent = implementContent.replace('//RequestParams', requestProps.join('\n'));
        implementContent = implementContent.replace('//AssignRequestParams', requestAssigns.join('\n    '));
        var responseProps = [];
        var responseAssign = [];
        for (var key in plugin.response) {
            if (plugin.response[key] === "string") {
                responseProps.push('@property (nonatomic, strong) NSString *' + key + ';')
                responseAssign.push('@"' + key + '": self.' + key + ' ?: @"",')
            }
            else if (plugin.response[key] === "int") {
                responseProps.push('@property (nonatomic, assign) NSInteger ' + key + ';')
                responseAssign.push('@"' + key + '": @(self.' + key + '),')
            }
            else if (plugin.response[key] === "float") {
                responseProps.push('@property (nonatomic, assign) float ' + key + ';')
                responseAssign.push('@"' + key + '": @(self.' + key + '),')
            }
            else if (plugin.response[key] === "boolean") {
                responseProps.push('@property (nonatomic, assign) BOOL ' + key + ';')
                responseAssign.push('@"' + key + '": @(self.' + key + '),')
            }
        }
        implementContent = implementContent.replace('//ResponseParams', responseProps.join('\n'));
        implementContent = implementContent.replace('//AssignResponseParams', responseAssign.join('\n           '));
        implementContent = implementContent.replace('[[LGOCore modules] addModuleWithName:@"Plugin.FOO" instance:[self new]];', '[[LGOCore modules] addModuleWithName:@"' + plugin.api + '" instance:[self new]];')
        implementContent = implementContent.replace(/FOO/ig, plugin.name);
        fs.writeFileSync(path.resolve(__dirname, '../ios/Source/LGO' + plugin.name + 'Plugin.m'), implementContent)
        var projContent = fs.readFileSync(path.resolve(__dirname, '../ios/plugin.xcodeproj/project.pbxproj'), 'utf-8');
        projContent = projContent.replace(/FOO/ig, plugin.name);
        fs.writeFileSync(path.resolve(__dirname, '../ios/plugin.xcodeproj/project.pbxproj'), projContent)
        var specContent = fs.readFileSync(path.resolve(__dirname, '../LEGO-SDK-Plugin-FOO.podspec'), 'utf-8');
        specContent = specContent.replace(/FOO/ig, plugin.name);
        fs.writeFileSync(path.resolve(__dirname, '../LEGO-SDK-Plugin-' + plugin.name + '.podspec'), specContent)
        var sampleContent = fs.readFileSync(path.resolve(__dirname, '../ios/plugin/sample.html'), 'utf-8');
        sampleContent = sampleContent.replace('Plugin.FOO', plugin.api);
        fs.writeFileSync(path.resolve(__dirname, '../ios/plugin/sample.html'), sampleContent)
        fs.unlinkSync(path.resolve(__dirname, '../ios/Source/LGOFOOPlugin.h'))
        fs.unlinkSync(path.resolve(__dirname, '../ios/Source/LGOFOOPlugin.m'))
        fs.unlinkSync(path.resolve(__dirname, '../LEGO-SDK-Plugin-FOO.podspec'))
    })();

    //Android

    (function () {
        var requestProps = [];
        var requestAssigns = [];
        for (var key in plugin.request) {
            if (plugin.request[key] === "string") {
                requestProps.push('var ' + key + ': String? = null')
                requestAssigns.push('request.' + key + ' = obj.optString("' + key + '")');
            }
            else if (plugin.request[key] === "int") {
                requestProps.push('var ' + key + ': Int? = null')
                requestAssigns.push('request.' + key + ' = obj.optInt("' + key + '", 0)');
            }
            else if (plugin.request[key] === "float") {
                requestProps.push('var ' + key + ': Float? = null')
                requestAssigns.push('request.' + key + ' = obj.optDouble("' + key + '", 0.0).toFloat()');
            }
            else if (plugin.request[key] === "boolean") {
                requestProps.push('var ' + key + ': Boolean? = null')
                requestAssigns.push('request.' + key + ' = obj.optBoolean("' + key + '", false)');
            }
        }
        var responseProps = [];
        var responseAssign = [];
        for (var key in plugin.response) {
            if (plugin.response[key] === "string") {
                responseProps.push('var ' + key + ': String? = null')
                responseAssign.push('Pair("' + key + '", this.' + key + ' ?: "")');
            }
            else if (plugin.response[key] === "int") {
                responseProps.push('var ' + key + ': Int? = null')
                responseAssign.push('Pair("' + key + '", this.' + key + ' ?: 0)');
            }
            else if (plugin.response[key] === "float") {
                responseProps.push('var ' + key + ': Float? = null')
                responseAssign.push('Pair("' + key + '", this.' + key + ' ?: 0)');
            }
            else if (plugin.response[key] === "boolean") {
                responseProps.push('var ' + key + ': Boolean? = null')
                responseAssign.push('Pair("' + key + '", this.' + key + ' ?: false)');
            }
        }
        var manifestContent = fs.readFileSync(path.resolve(__dirname, '../android/plugin/src/main/AndroidManifest.xml'), 'utf-8');
        manifestContent = manifestContent.replace('com.opensource.legosdk.plugin.foo', 'com.opensource.legosdk.plugin.' + plugin.name.toLowerCase())
        manifestContent = manifestContent.replace('com.opensource.legosdk.plugin.foo', 'com.opensource.legosdk.plugin.' + plugin.name.toLowerCase())
        manifestContent = manifestContent.replace('LGOModule.Plugin.FOO', 'LGOModule.' + plugin.api);
        manifestContent = manifestContent.replace(/FOO/ig, plugin.name);
        fs.writeFileSync(path.resolve(__dirname, '../android/plugin/src/main/AndroidManifest.xml'), manifestContent)
        try {
            fs.mkdirSync(path.resolve(__dirname, '../android/plugin/src/main/java/com/opensource/legosdk/plugin/' + plugin.name.toLowerCase()))
        } catch (error) { }
        var aContent = fs.readFileSync(path.resolve(__dirname, '../android/plugin/src/main/java/com/opensource/legosdk/plugin/foo/LGOFOO.kt'), 'utf-8');
        aContent = aContent.replace(/foo/g, plugin.name.toLowerCase())
        aContent = aContent.replace(/FOO/g, plugin.name)
        aContent = aContent.replace('//AssignRequestParams', requestAssigns.join('\n        '));
        fs.writeFileSync(path.resolve(__dirname, '../android/plugin/src/main/java/com/opensource/legosdk/plugin/' + plugin.name.toLowerCase() + '/LGO' + plugin.name + '.kt'), aContent)
        var bContent = fs.readFileSync(path.resolve(__dirname, '../android/plugin/src/main/java/com/opensource/legosdk/plugin/foo/LGOFOOOperation.kt'), 'utf-8');
        bContent = bContent.replace(/foo/g, plugin.name.toLowerCase())
        bContent = bContent.replace(/FOO/g, plugin.name)
        fs.writeFileSync(path.resolve(__dirname, '../android/plugin/src/main/java/com/opensource/legosdk/plugin/' + plugin.name.toLowerCase() + '/LGO' + plugin.name + 'Operation.kt'), bContent)
        var cContent = fs.readFileSync(path.resolve(__dirname, '../android/plugin/src/main/java/com/opensource/legosdk/plugin/foo/LGOFOORequest.kt'), 'utf-8');
        cContent = cContent.replace(/foo/g, plugin.name.toLowerCase())
        cContent = cContent.replace(/FOO/g, plugin.name)
        cContent = cContent.replace('//RequestParams', requestProps.join('\n    '));
        fs.writeFileSync(path.resolve(__dirname, '../android/plugin/src/main/java/com/opensource/legosdk/plugin/' + plugin.name.toLowerCase() + '/LGO' + plugin.name + 'Request.kt'), cContent)
        var dContent = fs.readFileSync(path.resolve(__dirname, '../android/plugin/src/main/java/com/opensource/legosdk/plugin/foo/LGOFOOResponse.kt'), 'utf-8');
        dContent = dContent.replace(/foo/g, plugin.name.toLowerCase())
        dContent = dContent.replace(/FOO/g, plugin.name)
        dContent = dContent.replace('//ResponseParams', responseProps.join('\n        '))
        dContent = dContent.replace('//AssignResponseParams', responseAssign.join(',\n            '));
        fs.writeFileSync(path.resolve(__dirname, '../android/plugin/src/main/java/com/opensource/legosdk/plugin/' + plugin.name.toLowerCase() + '/LGO' + plugin.name + 'Response.kt'), dContent)
        var sampleContent = fs.readFileSync(path.resolve(__dirname, '../android/app/src/main/assets/sample.html'), 'utf-8');
        sampleContent = sampleContent.replace('Plugin.FOO', plugin.api);
        fs.writeFileSync(path.resolve(__dirname, '../android/app/src/main/assets/sample.html'), sampleContent)
        fs.unlinkSync(path.resolve(__dirname, '../android/plugin/src/main/java/com/opensource/legosdk/plugin/foo/LGOFOO.kt'))
        fs.unlinkSync(path.resolve(__dirname, '../android/plugin/src/main/java/com/opensource/legosdk/plugin/foo/LGOFOOOperation.kt'))
        fs.unlinkSync(path.resolve(__dirname, '../android/plugin/src/main/java/com/opensource/legosdk/plugin/foo/LGOFOORequest.kt'))
        fs.unlinkSync(path.resolve(__dirname, '../android/plugin/src/main/java/com/opensource/legosdk/plugin/foo/LGOFOOResponse.kt'))
        fs.rmdirSync(path.resolve(__dirname, '../android/plugin/src/main/java/com/opensource/legosdk/plugin/foo'))
    })();
} catch (error) {
    console.error(error);
    console.log("操作失败，请重新下载模板，编辑 plugin.json 后再执行 npm start。")
}
