Pod::Spec.new do |s|

  s.name         = "LEGO-SDK-Plugin-AudioRecord"
  s.version      = "0.0.1"
  s.summary      = "A short description of LEGO-SDK-Plugin-AudioRecord."
  s.description  = <<-DESC
                   DESC
  s.homepage     = "http://EXAMPLE/LEGO-SDK-Plugin-AudioRecord"
  s.license      = "MIT (example)"
  s.author             = { "PonyCui"}
  s.platform     = :ios, "8.0"
  s.source       = { :git => "http://EXAMPLE/LEGO-SDK-Plugin-AudioRecord.git" }
  s.source_files  = "ios/Source/*.{h,m}"
  s.requires_arc = true

end
